import { Router } from "express";
import { getHomepageVideo } from "../controllers/homeController.js";

const homeRouter = Router();

homeRouter.get("/video", getHomepageVideo);

export default homeRouter;