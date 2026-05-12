import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import courseRouter from "./routes/courseRoutes.js";
import paymentRouter from "./routes/paymentRoutes.js";
import userRouter from "./routes/userRoutes.js";
import adminRouter from "./routes/adminRoutes.js";

const app = express();

app.set("trust proxy", 1);

const allowedOrigins = new Set(env.frontendOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true
  })
);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "course-app-backend" });
});

app.use("/api/payments/webhook", express.raw({ type: "application/json" }));
app.use(express.json());

app.use("/api/courses", courseRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);

app.use((error, _req, res, _next) => {
  console.error(error);

  if (error?.message?.startsWith("Not allowed by CORS")) {
    return res.status(403).json({ message: error.message });
  }

  if (error?.code === "PGRST116") {
    return res.status(404).json({ message: "Resource not found" });
  }

  return res.status(500).json({
    message: error?.message || "Something went wrong"
  });
});

app.listen(env.port, () => {
  console.log(`Backend running on http://localhost:${env.port}`);
});
