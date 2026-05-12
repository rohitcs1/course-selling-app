import Razorpay from "razorpay";
import crypto from "crypto";
import { env } from "../config/env.js";

export const razorpay = new Razorpay({
  key_id: env.razorpayKeyId,
  key_secret: env.razorpayKeySecret
});

export function verifyRazorpayWebhookSignature(rawBodyBuffer, signatureHeader) {
  const expectedSignature = crypto
    .createHmac("sha256", env.razorpayWebhookSecret)
    .update(rawBodyBuffer)
    .digest("hex");

  return expectedSignature === signatureHeader;
}
