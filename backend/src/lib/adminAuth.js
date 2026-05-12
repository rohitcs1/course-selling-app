import crypto from "crypto";
import { supabase } from "./supabase.js";

export function buildPasswordHash(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function validateAdminCredentials(username, password) {
  const normalizedUsername = username.trim().toLowerCase();
  const passwordHash = buildPasswordHash(password);

  const { data, error } = await supabase
    .from("admin_users")
    .select("id")
    .eq("username", normalizedUsername)
    .eq("password_hash", passwordHash)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data?.id);
}

export function generateAdminToken() {
  return "admin_token_" + Date.now() + "_" + Math.random().toString(36).slice(2);
}

const adminTokens = new Map();

export function storeAdminToken(token) {
  adminTokens.set(token, { createdAt: Date.now() });
}

export function verifyAdminToken(token) {
  return adminTokens.has(token);
}

export function revokeAdminToken(token) {
  adminTokens.delete(token);
}
