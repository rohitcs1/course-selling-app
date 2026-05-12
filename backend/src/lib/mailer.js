import nodemailer from "nodemailer";
import { env } from "../config/env.js";

export const transporter = nodemailer.createTransport({
  host: env.smtpHost,
  port: env.smtpPort,
  secure: env.smtpSecure,
  auth: {
    user: env.smtpUser,
    pass: env.smtpPass
  }
});

// Verify transporter at startup so SMTP issues are visible early
transporter.verify().then(() => {
  console.log("Mailer transporter verified: ready to send emails");
}).catch((err) => {
  console.error("Mailer transporter verification failed:", err?.message || err);
});
