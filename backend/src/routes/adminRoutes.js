import { Router } from "express";
import { adminLogin, adminLogout, adminAuthMiddleware, adminSendTestEmail } from "../controllers/adminController.js";

const adminRouter = Router();

adminRouter.post("/login", adminLogin);
adminRouter.post("/logout", adminLogout);
adminRouter.post("/test-email", adminAuthMiddleware, adminSendTestEmail);

export default adminRouter;
