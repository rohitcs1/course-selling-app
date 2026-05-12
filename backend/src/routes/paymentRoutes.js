import { Router } from "express";
import { createOrder, handleWebhook } from "../controllers/paymentController.js";

const paymentRouter = Router();

paymentRouter.post("/create-order", createOrder);
paymentRouter.post("/webhook", handleWebhook);

export default paymentRouter;
