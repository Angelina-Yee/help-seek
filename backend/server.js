import "dotenv/config.js";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import createError from "http-errors";
import {connectDB} from "./config/db.js";
import authRoutes from "./routes/auth.js";

const app = express();

app.use(cors({origin: process.env.FRONTEND_URL || true }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", authRoutes);

app.use((_req, _res, next) => next(createError(404, "Not found")));
app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  const payload = { status, message: err.message || "Server error" };
  if (err.errors) payload.errors = err.errors;
  res.status(status).json(payload);
});

const PORT = process.env.PORT || 4000;
connectDB()
  .then(() => app.listen(PORT, () => console.log(`Server running on http://localhost: ${PORT}`)))
  .catch((e) => {
    console.error("DB connect failed:", e);
    process.exit(1);
  });