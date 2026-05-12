import { verifyRazorpayWebhookSignature } from "../lib/razorpay.js";
import { createPaymentOrder, createEnrollment, getOrderDetailsByRazorpayOrderId, markOrderFailed, markOrderPaid } from "../services/paymentService.js";
import { logEmailStatus, sendCourseWelcomeEmail } from "../services/emailService.js";

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

      const paidOrder = await markOrderPaid({
        razorpayOrderId,
        razorpayPaymentId
      });

      const enrollment = await createEnrollment({
        userId: paidOrder.user_id,
        courseId: paidOrder.course_id
      });

      const orderDetails = await getOrderDetailsByRazorpayOrderId(razorpayOrderId);

      try {
        const mailResult = await sendCourseWelcomeEmail({
          userName: orderDetails.users.name,
          userEmail: orderDetails.users.email,
          courseTitle: orderDetails.courses.title,
          driveLink: orderDetails.courses.drive_link,
          orderId: orderDetails.id,
          purchaseDate: paidOrder.paid_at || orderDetails.paid_at || orderDetails.created_at
        });

        await logEmailStatus({
          userId: orderDetails.user_id,
          courseId: orderDetails.course_id,
          emailType: "welcome_and_access",
          status: "sent",
          providerMessageId: mailResult.messageId
        });
      } catch (mailError) {
        await logEmailStatus({
          userId: orderDetails.user_id,
          courseId: orderDetails.course_id,
          emailType: "welcome_and_access",
          status: "failed",
          error: mailError.message
        });
      }

      return res.status(200).json({
        message: "Payment captured, enrollment granted",
        enrollmentId: enrollment.id
      });
    }

    if (event.event === "payment.failed") {
      const razorpayOrderId = event.payload.payment.entity.order_id;
      await markOrderFailed({ razorpayOrderId });
      return res.status(200).json({ message: "Payment failed event processed" });
    }

    return res.status(200).json({ message: "Event ignored" });
  } catch (error) {
    return next(error);
  }
}
