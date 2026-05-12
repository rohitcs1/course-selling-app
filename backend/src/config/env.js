import dotenv from "dotenv";

dotenv.config();

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function parseOrigins(value) {
  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function defaultFrontendOrigins() {
  if (process.env.NODE_ENV === "production") {
    return ["https://rasoiroom.in", "https://www.rasoiroom.in"];
  }

  return ["http://localhost:5173"];
}

export const env = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || "development",
  frontendOrigins: process.env.FRONTEND_ORIGINS
    ? parseOrigins(process.env.FRONTEND_ORIGINS)
    : process.env.FRONTEND_ORIGIN
      ? [process.env.FRONTEND_ORIGIN.trim()]
      : defaultFrontendOrigins(),
  supabaseUrl: required("SUPABASE_URL"),
  supabaseServiceRoleKey: required("SUPABASE_SERVICE_ROLE_KEY"),
  razorpayKeyId: required("RAZORPAY_KEY_ID"),
  razorpayKeySecret: required("RAZORPAY_KEY_SECRET"),
  razorpayWebhookSecret: required("RAZORPAY_WEBHOOK_SECRET"),
  smtpHost: required("SMTP_HOST"),
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpSecure: process.env.SMTP_SECURE === "true",
  smtpUser: required("SMTP_USER"),
  smtpPass: required("SMTP_PASS"),
  emailFrom: required("EMAIL_FROM"),
  adminApiKey: required("ADMIN_API_KEY")
};
