import { verifyRazorpayWebhookSignature } from "../lib/razorpay.js";
import { createPaymentOrder, fulfillSuccessfulPayment, markOrderFailed } from "../services/paymentService.js";
import { env } from "../config/env.js";
import crypto from "crypto";

export async function createOrder(req, res, next) {
  try {
    const { courseId, name, email, phone } = req.body;

    if (!courseId || !name || !email) {
      return res.status(400).json({ message: "courseId, name, email are required" });
    }

    const order = await createPaymentOrder({ courseId, name, email, phone });
    return res.status(201).json(order);
  } catch (error) {
    return next(error);
  }
}

export async function verifyPayment(req, res, next) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "razorpay_order_id, razorpay_payment_id, and razorpay_signature are required" });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    try {
      const expectedSignature = crypto
        .createHmac("sha256", env.razorpayKeySecret)
        .update(body)
        .digest("hex");

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ message: "Payment signature verification failed" });
      }

      const result = await fulfillSuccessfulPayment({
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id
      });

      return res.status(200).json({
        message: result.alreadyProcessed ? "Payment already processed" : "Payment verified",
        valid: true,
        alreadyProcessed: Boolean(result.alreadyProcessed)
      });
    } catch (hashError) {
      console.error("Error during HMAC calculation:", hashError);
      throw hashError;
    }
  } catch (error) {
    console.error("❌ Payment verification error:", error);
    return res.status(500).json({ message: "Payment verification failed: " + (error?.message || "Unknown error") });
  }
}

export async function handleWebhook(req, res, next) {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const isValid = verifyRazorpayWebhookSignature(req.body, signature);

    if (!isValid) {
      return res.status(400).json({ message: "Invalid webhook signature" });
    }

    const event = JSON.parse(req.body.toString("utf8"));

    if (event.event === "payment.captured") {
      const razorpayOrderId = event.payload.payment.entity.order_id;
      const razorpayPaymentId = event.payload.payment.entity.id;

      const result = await fulfillSuccessfulPayment({
        razorpayOrderId,
        razorpayPaymentId
      });

      return res.status(200).json({
        message: "Payment captured, enrollment granted",
        enrollmentId: result.enrollment?.id || null,
        alreadyProcessed: Boolean(result.alreadyProcessed)
      });
    }

    if (event.event === "payment.failed") {
      const razorpayOrderId = event.payload.payment.entity.order_id;
      await markOrderFailed({ razorpayOrderId });
      return res.status(200).json({ message: "Payment failed event processed" });
    }

    return res.status(200).json({ message: "Event ignored" });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return next(error);
  }
}
