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

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("id,name,email")
    .eq("email", normalizedEmail)
    .single();

  if (userError) {
    if (userError.code === "PGRST116") {
      return [];
    }
    throw userError;
  }

  if (!userData) {
    return [];
  }

  const { data, error } = await supabase
    .from("enrollments")
    .select(
      "id,created_at,user_id,course_id,drive_link,courses(id,title,heading,price,drive_link,thumbnail_url,duration,level,description),users(id,email,name)"
    )
    .eq("user_id", userData.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}
