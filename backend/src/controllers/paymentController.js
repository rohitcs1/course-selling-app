import { verifyRazorpayWebhookSignature } from "../lib/razorpay.js";
import {
  createPaymentOrder,
  createEnrollment,
  getOrderDetailsByRazorpayOrderId,
  markOrderFailed,
  markOrderPaid
} from "../services/paymentService.js";
import { logEmailStatus, sendCourseWelcomeEmail } from "../services/emailService.js";
import { env } from "../config/env.js";
import crypto from "crypto";

async function sendWelcomeEmailAsync(orderDetails) {
  try {
    const mailResult = await sendCourseWelcomeEmail({
      userName: orderDetails.users.name,
      userEmail: orderDetails.users.email,
      courseTitle: orderDetails.courses.title,
      driveLink: orderDetails.courses.drive_link,
      orderId: orderDetails.id,
      purchaseDate: orderDetails.paid_at || orderDetails.created_at
    });

    await logEmailStatus({
      userId: orderDetails.user_id,
      courseId: orderDetails.course_id,
      emailType: "welcome_and_access",
      status: "sent",
      providerMessageId: mailResult.messageId
    });
  } catch (mailError) {
    try {
      await logEmailStatus({
        userId: orderDetails.user_id,
        courseId: orderDetails.course_id,
        emailType: "welcome_and_access",
        status: "failed",
        error: mailError.message
      });
    } catch (logError) {
      console.error("Failed to write email log:", logError);
    }
  }
}

async function finalizePaidOrder({ razorpayOrderId, razorpayPaymentId }) {
  const orderDetails = await getOrderDetailsByRazorpayOrderId(razorpayOrderId);
  let shouldSendWelcomeEmail = false;

  if (orderDetails.status !== "paid") {
    const paidOrder = await markOrderPaid({ razorpayOrderId, razorpayPaymentId });
    shouldSendWelcomeEmail = Boolean(paidOrder);
  }

  const enrollment = await createEnrollment({
    userId: orderDetails.user_id,
    courseId: orderDetails.course_id
  });

  if (shouldSendWelcomeEmail) {
    setImmediate(() => {
      sendWelcomeEmailAsync(orderDetails).catch((error) => {
        console.error("Background welcome email workflow failed:", error);
      });
    });
  }

  return {
    orderDetails,
    enrollment
  };
} 

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

    console.log("verifyPayment called with:", {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature: razorpay_signature ? razorpay_signature.substring(0, 20) + "..." : "missing",
      keySecret: env.razorpayKeySecret ? "present" : "MISSING"
    });

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.error("Missing required fields:", {
        razorpay_order_id: !!razorpay_order_id,
        razorpay_payment_id: !!razorpay_payment_id,
        razorpay_signature: !!razorpay_signature
      });
      return res.status(400).json({ message: "razorpay_order_id, razorpay_payment_id, and razorpay_signature are required" });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    console.log("Verifying body:", body);

    try {
      const expectedSignature = crypto
        .createHmac("sha256", env.razorpayKeySecret)
        .update(body)
        .digest("hex");

      console.log("Signature comparison:", {
        expected: expectedSignature.substring(0, 20) + "...",
        received: razorpay_signature.substring(0, 20) + "...",
        match: expectedSignature === razorpay_signature
      });

      if (expectedSignature !== razorpay_signature) {
        console.error("❌ Payment signature verification FAILED - signature mismatch");
        return res.status(400).json({ message: "Payment signature verification failed" });
      }

      console.log("✅ Payment signature verified successfully for orderId:", razorpay_order_id);

      const { orderDetails, enrollment } = await finalizePaidOrder({
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id
      });

      return res.status(200).json({
        message: "Payment verified",
        valid: true,
        enrollmentId: enrollment.id,
        driveLink: orderDetails.courses?.drive_link || null
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
    console.log("Webhook event received:", event.event);

    if (event.event === "payment.captured") {
      const razorpayOrderId = event.payload.payment.entity.order_id;
      const razorpayPaymentId = event.payload.payment.entity.id;
      console.log("Payment captured - orderId:", razorpayOrderId, "paymentId:", razorpayPaymentId);

      const { orderDetails, enrollment } = await finalizePaidOrder({
        razorpayOrderId,
        razorpayPaymentId
      });
      console.log("Order finalized:", orderDetails.id, "Enrollment:", enrollment.id);

      return res.status(200).json({
        message: "Payment captured, enrollment granted",
        enrollmentId: enrollment.id,
        driveLink: orderDetails.courses?.drive_link || null
      });
    }

    if (event.event === "payment.failed") {
      const razorpayOrderId = event.payload.payment.entity.order_id;
      console.log("Payment failed - orderId:", razorpayOrderId);
      await markOrderFailed({ razorpayOrderId });
      return res.status(200).json({ message: "Payment failed event processed" });
    }

    return res.status(200).json({ message: "Event ignored" });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return next(error);
  }
}
