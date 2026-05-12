import { Router } from "express";
import { createOrder, handleWebhook, verifyPayment } from "../controllers/paymentController.js";

const paymentRouter = Router();

paymentRouter.post("/create-order", createOrder);
paymentRouter.post("/verify", verifyPayment);
paymentRouter.post("/webhook", handleWebhook);

export default paymentRouter;
