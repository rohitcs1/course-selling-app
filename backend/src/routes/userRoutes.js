import { Router } from "express";
import { listMyEnrollments } from "../controllers/userController.js";

const userRouter = Router();

userRouter.get("/enrollments", listMyEnrollments);

export default userRouter;
