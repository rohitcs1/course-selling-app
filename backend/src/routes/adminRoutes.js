import { Router } from "express";
import {
	adminLogin,
	adminLogout,
	adminAuthMiddleware,
	adminSendTestEmail,
	adminGetHomepageVideo,
	adminUpdateHomepageVideo
} from "../controllers/adminController.js";

const adminRouter = Router();

adminRouter.post("/login", adminLogin);
adminRouter.post("/logout", adminLogout);
adminRouter.post("/test-email", adminAuthMiddleware, adminSendTestEmail);
adminRouter.get("/homepage-video", adminAuthMiddleware, adminGetHomepageVideo);
adminRouter.put("/homepage-video", adminAuthMiddleware, adminUpdateHomepageVideo);

export default adminRouter;
