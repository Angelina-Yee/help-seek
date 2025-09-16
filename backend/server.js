import "dotenv/config.js";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import createError from "http-errors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import profileRouter from "./routes/profile.js";
import cookieParser from "cookie-parser";

const app = express();

//Enable Cors for frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

//Parse JSON requests and log requests
app.use(express.json());
app.use(morgan("dev"));

//Check health
app.get("/health", (_req, res) => res.json({ ok: true }));

//API routes
app.use("/auth", authRoutes);
app.use("/api/profile", profileRouter);

//404 handler
app.use((_req, _res, next) => next(createError(404, "Not found")));

//Error handler
app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  const payload = { status, message: err.message || "Server error" };
  if (err.errors) payload.errors = err.errors;
  res.status(status).json(payload);
});

//Parse cookies
app.use(cookieParser());

//Start server
const PORT = Number((process.env.PORT || "4000").trim());
connectDB()
  .then(() =>
    app.listen(PORT, "0.0.0.0", () =>
      console.log(`Server running on http://localhost:${PORT}`)
    )
  )
  .catch((e) => {
    console.error("DB connect failed:", e);
    process.exit(1);
  });