import {
  createCourse,
  deleteCourseById,
  getAllCoursesAdmin,
  getCourseById,
  getPublishedCourses,
  updateCourseById
} from "../services/courseService.js";

export async function listCourses(req, res, next) {
  try {
    const courses = await getPublishedCourses();
    return res.json({ courses });
  } catch (error) {
    return next(error);
  }
}

export async function getCourse(req, res, next) {
  try {
    const course = await getCourseById(req.params.courseId);
    return res.json({ course });
  } catch (error) {
    return next(error);
  }
}

export async function adminCreateCourse(req, res, next) {
  try {
    const payload = req.body;
    if (!payload?.title || !payload?.price || !payload?.driveLink) {
      return res.status(400).json({
        message: "title, price and driveLink are required"
      });
    }

    const id =
      payload.id ||
      payload.title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");

    const course = await createCourse({
      id,
      title: payload.title,
      heading: payload.heading || payload.title,
      description: payload.description || "",
      price: Number(payload.price),
      thumbnailUrl: payload.thumbnailUrl || null,
      duration: payload.duration || "Self-paced",
      level: payload.level || "Beginner",
      driveLink: payload.driveLink,
      isPublished: payload.isPublished ?? true
    });

    return res.status(201).json({ message: "Course created", course });
  } catch (error) {
    return next(error);
  }
}

export async function listAllCoursesForAdmin(_req, res, next) {
  try {
    const courses = await getAllCoursesAdmin();
    return res.json({ courses });
  } catch (error) {
    return next(error);
  }
}

export async function adminUpdateCourse(req, res, next) {
  try {
    const { courseId } = req.params;
    const payload = req.body;
    console.log("adminUpdateCourse called - courseId:", courseId, "payload keys:", Object.keys(payload || {}));

    if (!payload?.title || !payload?.price || !payload?.driveLink) {
      console.log("Validation failed - missing required fields");
      return res.status(400).json({ message: "title, price and driveLink are required" });
    }

    const course = await updateCourseById(courseId, {
      title: payload.title,
      heading: payload.heading || payload.title,
      description: payload.description || "",
      price: Number(payload.price),
      thumbnailUrl: payload.thumbnailUrl || null,
      duration: payload.duration || "Self-paced",
      level: payload.level || "Beginner",
      driveLink: payload.driveLink,
      isPublished: payload.isPublished ?? true
    });

    console.log("Course updated successfully:", course?.id);
    return res.json({ message: "Course updated", course });
  } catch (error) {
    console.error("adminUpdateCourse error:", error);
    return next(error);
  }
}

export async function adminDeleteCourse(req, res, next) {
  try {
    const { courseId } = req.params;
    console.log("adminDeleteCourse called - courseId:", courseId);
    await deleteCourseById(courseId);
    console.log("Course deleted successfully:", courseId);
    return res.json({ message: "Course deleted" });
  } catch (error) {
    console.error("adminDeleteCourse error:", error);
    return next(error);
  }
}
