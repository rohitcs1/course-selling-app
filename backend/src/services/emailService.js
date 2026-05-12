import { transporter } from "../lib/mailer.js";
import { env } from "../config/env.js";
import { supabase } from "../lib/supabase.js";

export async function sendCourseWelcomeEmail({ userName, userEmail, courseTitle, driveLink, orderId, purchaseDate }) {
  const subject = `Course Purchase Successful: ${courseTitle}`;
  const purchaseDateStr = purchaseDate ? new Date(purchaseDate).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : null;
  const accessSection = driveLink
    ? `
      <p style="margin: 24px 0 10px;">
        <a href="${driveLink}" style="background:#d83f31;color:#fff;padding:13px 20px;border-radius:10px;text-decoration:none;display:inline-block;font-weight:700;letter-spacing:0.01em;">
          Open Your Google Drive Access
        </a>
      </p>
      <p style="margin: 0;color:#5a6b5f;font-size:14px;line-height:1.7;">
        If the button does not open directly, copy this link into your browser:<br />
        <a href="${driveLink}" style="color:#8f271e;word-break:break-all;">${driveLink}</a>
      </p>
    `
    : `
      <p style="margin: 24px 0 0;color:#5a6b5f;font-size:14px;line-height:1.7;">
        Your course access link will be shared shortly. If you do not receive it, please contact support.
      </p>
    `;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 680px; margin: 0 auto; color: #1f2937; background: #ffffff; border: 1px solid rgba(17,34,24,0.08); border-radius: 18px; overflow: hidden; box-shadow: 0 14px 30px rgba(17, 34, 24, 0.1);">
      <div style="padding: 28px 28px 20px; background: linear-gradient(135deg, #fce6de 0%, #eef8ef 100%); border-bottom: 1px solid rgba(17,34,24,0.08);">
        <p style="margin: 0 0 10px; font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 700; color: #8f271e;">Payment Successful</p>
        <h1 style="margin: 0; font-size: 28px; line-height: 1.2; color: #112218;">Welcome to ${courseTitle}</h1>
        <p style="margin: 12px 0 0; color: #5a6b5f; font-size: 15px; line-height: 1.7;">Your enrollment has been confirmed and your learning materials are ready.</p>
      </div>
      <div style="padding: 28px;">
        <p style="margin: 0 0 14px; font-size: 16px; line-height: 1.8;">Hi ${userName},</p>
        <p style="margin: 0 0 14px; font-size: 16px; line-height: 1.8; color: #334155;">Thank you for purchasing <strong>${courseTitle}</strong>. We have successfully received your payment and activated your course access.</p>
        ${orderId ? `<p style="margin: 8px 0 0; font-size:14px;color:#5a6b5f;">Order ID: <strong>${orderId}</strong></p>` : ""}
        ${purchaseDateStr ? `<p style="margin: 4px 0 12px; font-size:14px;color:#5a6b5f;">Purchase Date: <strong>${purchaseDateStr}</strong></p>` : ""}
        <div style="margin: 22px 0; padding: 18px; border-radius: 14px; background: #f7f8f5; border: 1px solid rgba(17,34,24,0.08);">
          <p style="margin: 0 0 8px; font-weight: 700; color: #112218;">What you get next</p>
          <p style="margin: 0; color: #5a6b5f; font-size: 14px; line-height: 1.7;">Instant access to your course resources, Google Drive materials, and all learning content linked to your enrollment.</p>
        </div>
        ${accessSection}
        <p style="margin: 26px 0 0; color: #5a6b5f; font-size: 14px; line-height: 1.7;">If you need help, reply to this email and our team will assist you.</p>
        <p style="margin: 20px 0 0; font-size: 15px; line-height: 1.7;">Regards,<br /><strong>CourseNest Team</strong></p>
      </div>
    </div>
  `;

  const result = await transporter.sendMail({
    from: env.emailFrom,
    to: userEmail,
    subject,
    html
  });

  return result;
}

export async function logEmailStatus({ userId, courseId, emailType, status, providerMessageId, error }) {
  const { error: insertError } = await supabase.from("email_logs").insert({
    user_id: userId,
    course_id: courseId,
    email_type: emailType,
    sent_status: status,
    provider_message_id: providerMessageId || null,
    error_text: error || null
  });

  if (insertError) {
    throw insertError;
  }
}
