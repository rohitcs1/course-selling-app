import { supabase } from "../lib/supabase.js";

export async function getPublishedCourses() {
  const { data, error } = await supabase
    .from("courses")
    .select("id,title,heading,description,price,thumbnail_url,duration,level,is_published")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

export async function getAllCoursesAdmin() {
  const { data, error } = await supabase
    .from("courses")
    .select(
      "id,title,heading,description,price,thumbnail_url,duration,level,drive_link,is_published,created_at"
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

export async function getCourseById(courseId) {
  const { data, error } = await supabase
    .from("courses")
    .select(
      "id,title,heading,description,price,thumbnail_url,duration,level,drive_link,is_published,created_at"
    )
    .eq("id", courseId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function createCourse(payload) {
  const { data, error } = await supabase
    .from("courses")
    .insert({
      id: payload.id,
      title: payload.title,
      heading: payload.heading,
      description: payload.description,
      price: payload.price,
      thumbnail_url: payload.thumbnailUrl,
      duration: payload.duration,
      level: payload.level,
      drive_link: payload.driveLink,
      is_published: payload.isPublished
    })
    .select("id,title,price,is_published")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateCourseById(courseId, payload) {
  console.log("updateCourseById - courseId:", courseId);
  const { data, error } = await supabase
    .from("courses")
    .update({
      title: payload.title,
      heading: payload.heading,
      description: payload.description,
      price: payload.price,
      thumbnail_url: payload.thumbnailUrl,
      duration: payload.duration,
      level: payload.level,
      drive_link: payload.driveLink,
      is_published: payload.isPublished
    })
    .eq("id", courseId)
    .select("id,title,heading,description,price,thumbnail_url,duration,level,drive_link,is_published")
    .single();

  if (error) {
    console.error("updateCourseById error:", error);
    throw error;
  }

  console.log("updateCourseById success - returned course:", data?.id);
  return data;
}

export async function deleteCourseById(courseId) {
  console.log("deleteCourseById - courseId:", courseId);
  const { error } = await supabase.from("courses").delete().eq("id", courseId);

  if (error) {
    console.error("deleteCourseById error:", error);
    
    // Handle foreign key constraint error
    if (error.code === "23503") {
      const err = new Error("Cannot delete course with existing orders or enrollments. Please contact support if you need to delete this course.");
      err.code = "CONSTRAINT_VIOLATION";
      throw err;
    }
    
    throw error;
  }

  console.log("deleteCourseById success");
}
