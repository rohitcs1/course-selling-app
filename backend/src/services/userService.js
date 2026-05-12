import { supabase } from "../lib/supabase.js";

export async function upsertUser({ name, email, phone }) {
  const normalizedEmail = email.trim().toLowerCase();

  const { data, error } = await supabase
    .from("users")
    .upsert(
      {
        name: name.trim(),
        email: normalizedEmail,
        phone: phone?.trim() || null
      },
      { onConflict: "email" }
    )
    .select("id,name,email,phone")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getEnrollmentsByEmail(email) {
  const normalizedEmail = email.trim().toLowerCase();

  const { data, error } = await supabase
    .from("enrollments")
    .select(
      "id,created_at,courses!inner(id,title,heading,price,drive_link,thumbnail_url),users!inner(email,name)"
    )
    .eq("users.email", normalizedEmail)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}
