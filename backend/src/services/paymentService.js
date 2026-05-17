import { razorpay } from "../lib/razorpay.js";
import { supabase } from "../lib/supabase.js";
import { env } from "../config/env.js";
import { getCourseById } from "./courseService.js";
import { upsertUser } from "./userService.js";
import { logEmailStatus, sendCourseWelcomeEmail } from "./emailService.js";

export async function createPaymentOrder({ courseId, name, email, phone }) {
  const course = await getCourseById(courseId);

  if (!course || !course.is_published) {
    throw new Error("Course not found or not available for purchase.");
  }

  const user = await upsertUser({ name, email, phone });

  const razorpayOrder = await razorpay.orders.create({
    amount: Number(course.price) * 100,
    currency: "INR",
    receipt: `rcpt_${Date.now()}`,
    payment_capture: 1
  });

  const { error } = await supabase.from("orders").insert({
    user_id: user.id,
    course_id: course.id,
    razorpay_order_id: razorpayOrder.id,
    amount: course.price,
    status: "created"
  });

  if (error) {
    throw error;
  }

  return {
    keyId: env.razorpayKeyId,
    orderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    courseTitle: course.title,
    user
  };
}

export async function markOrderPaid({ razorpayOrderId, razorpayPaymentId }) {
  const { data, error } = await supabase
    .from("orders")
    .update({
      status: "paid",
      razorpay_payment_id: razorpayPaymentId,
      paid_at: new Date().toISOString()
    })
    .eq("razorpay_order_id", razorpayOrderId)
    .select("id,user_id,course_id,amount,status,paid_at,razorpay_payment_id,razorpay_order_id,created_at")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function markOrderFailed({ razorpayOrderId }) {
  const { error } = await supabase
    .from("orders")
    .update({ status: "failed" })
    .eq("razorpay_order_id", razorpayOrderId);

  if (error) {
    throw error;
  }
}

export async function createEnrollment({ userId, courseId, driveLink = null }) {
  const { data, error } = await supabase
    .from("enrollments")
    .upsert({ user_id: userId, course_id: courseId, drive_link: driveLink }, { onConflict: "user_id,course_id" })
    .select("id,user_id,course_id,drive_link,created_at")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function fulfillSuccessfulPayment({ razorpayOrderId, razorpayPaymentId }) {
  const orderDetails = await getOrderDetailsByRazorpayOrderId(razorpayOrderId);

  if (orderDetails.status === "paid") {
    return { order: orderDetails, enrollment: null, alreadyProcessed: true };
  }

  const paidOrder = await markOrderPaid({ razorpayOrderId, razorpayPaymentId });
  const enrollment = await createEnrollment({
    userId: paidOrder.user_id,
    courseId: paidOrder.course_id,
    driveLink: orderDetails.courses?.drive_link || null
  });

  try {
    const mailResult = await sendCourseWelcomeEmail({
      userName: orderDetails.users.name,
      userEmail: orderDetails.users.email,
      courseTitle: orderDetails.courses.title,
      driveLink: orderDetails.courses.drive_link,
      orderId: paidOrder.id,
      purchaseDate: paidOrder.paid_at || orderDetails.created_at
    });

    await logEmailStatus({
      userId: paidOrder.user_id,
      courseId: paidOrder.course_id,
      emailType: "welcome_and_access",
      status: "sent",
      providerMessageId: mailResult.messageId
    });
  } catch (mailError) {
    await logEmailStatus({
      userId: paidOrder.user_id,
      courseId: paidOrder.course_id,
      emailType: "welcome_and_access",
      status: "failed",
      error: mailError.message
    });
  }

  if (enrollment?.id && orderDetails.courses?.drive_link) {
    const { error: updateError } = await supabase
      .from("enrollments")
      .update({ drive_link: orderDetails.courses.drive_link })
      .eq("id", enrollment.id);

    if (updateError) {
      throw updateError;
    }
  }

  return { order: paidOrder, enrollment, alreadyProcessed: false };
}

export async function getOrderDetailsByRazorpayOrderId(razorpayOrderId) {
  const { data, error } = await supabase
    .from("orders")
    .select("id,user_id,course_id,razorpay_order_id,status,paid_at,created_at,users(name,email),courses(title,drive_link)")
    .eq("razorpay_order_id", razorpayOrderId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}
