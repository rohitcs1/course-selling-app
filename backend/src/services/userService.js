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
  console.log("getEnrollmentsByEmail - searching for email:", normalizedEmail);

  // First, get the user by email to find their user_id
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("id,name,email")
    .eq("email", normalizedEmail)
    .single();

  if (userError) {
    if (userError.code === "PGRST116") {
      // User not found
      console.log("User not found for email:", normalizedEmail);
      return [];
    }
    console.error("Error fetching user by email:", userError);
    throw userError;
  }

  if (!userData) {
    console.log("No user data returned for email:", normalizedEmail);
    return [];
  }

  console.log("Found user:", userData.id, "email:", userData.email);

  // Then, get their enrollments with full course details
  const { data, error } = await supabase
    .from("enrollments")
    .select(
      "id,created_at,user_id,course_id,courses(id,title,heading,price,drive_link,thumbnail_url,duration,level,description),users(id,email,name)"
    )
    .eq("user_id", userData.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching enrollments for user:", userData.id, "error:", error);
    throw error;
  }

  console.log("Found enrollments:", data?.length || 0, "for user:", userData.id);
  if (data && data.length > 0) {
    data.forEach((enrollment, idx) => {
      console.log(`Enrollment ${idx}:`, {
        enrollmentId: enrollment.id,
        courseId: enrollment.course_id,
        courseTitle: enrollment.courses?.title,
        driveLink: enrollment.courses?.drive_link || "MISSING"
      });
    });
  }

  return data;
}
