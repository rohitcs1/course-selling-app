import { Router } from "express";
import {
	adminCreateCourse,
	adminDeleteCourse,
	adminUpdateCourse,
	getCourse,
	listAllCoursesForAdmin,
	listCourses
} from "../controllers/courseController.js";
import { adminAuthMiddleware } from "../controllers/adminController.js";

const courseRouter = Router();

courseRouter.get("/", listCourses);
courseRouter.get("/admin/all", adminAuthMiddleware, listAllCoursesForAdmin);
courseRouter.post("/admin", adminAuthMiddleware, adminCreateCourse);
courseRouter.put("/admin/:courseId", adminAuthMiddleware, adminUpdateCourse);
courseRouter.delete("/admin/:courseId", adminAuthMiddleware, adminDeleteCourse);
courseRouter.get("/:courseId", getCourse);

export default courseRouter;
