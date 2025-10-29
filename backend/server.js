import "dotenv/config.js";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import createError from "http-errors";
import fs from "fs";
import http from "http";
import https from "https";
import path from "path";
import { fileURLToPath } from "url";

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import profileRouter from "./routes/profile.js";
import postsRouter from "./routes/posts.js";

import threadsRouter from "./routes/threads.js";
import uploadRouter from "./routes/upload.js";
import visionRouter from "./routes/vision.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.set("trust proxy", 1);
app.use(cookieParser());

// CORS
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const allowed = new Set([
  FRONTEND_URL,
  "http://localhost:3000",
  "https://localhost:3000",
  "http://localhost:3001",
  "https://localhost:3001",
  "http://localhost:3005",
  "https://localhost:3005",
]);

app.use(
  cors({
    origin(origin, cb) {
      if (!origin || allowed.has(origin)) return cb(null, true);
      cb(new Error("Not allowed by CORS: " + origin));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Logging and body parsing
app.use(express.json());
app.use(morgan("dev"));
app.disable("x-powered-by");

// Serve uploaded images
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Routes
app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/auth", authRoutes);
app.use("/api/profile", profileRouter);
app.use("/api/posts", postsRouter);
app.use("/api/threads", threadsRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/vision", visionRouter);

// 404 and error handler
app.use((_req, _res, next) => next(createError(404, "Not found")));
app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  const payload = { status, message: err.message || "Server error" };
  if (err.errors) payload.errors = err.errors;
  res.status(status).json(payload);
});

// Start server
const PORT = Number((process.env.PORT || "4000").trim());
let USE_HTTPS = (process.env.USE_HTTPS || "false").toLowerCase() === "true";

// Check certs if HTTPS
const KEY_PATH =
  process.env.SSL_KEY || path.join(__dirname, "certs/localhost.key");
const CERT_PATH =
  process.env.SSL_CERT || path.join(__dirname, "certs/localhost.crt");
if (USE_HTTPS) {
  try {
    fs.accessSync(KEY_PATH);
    fs.accessSync(CERT_PATH);
  } catch {
    console.warn(
      "[HTTPS] Certs missing; falling back to HTTP. Set USE_HTTPS=false to hide this."
    );
    USE_HTTPS = false;
  }
}

// Bootstrap
async function start() {
  await connectDB();

  if (USE_HTTPS) {
    const creds = {
      key: fs.readFileSync(KEY_PATH),
      cert: fs.readFileSync(CERT_PATH),
    };
    https.createServer(creds, app).listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on https://localhost:${PORT}`);
      console.log(`CORS allowed origin: ${FRONTEND_URL}`);
    });
  } else {
    http.createServer(app).listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`CORS allowed origin: ${FRONTEND_URL}`);
    });
  }
}

start().catch((e) => {
  console.error("Boot failed:", e);
  process.exit(1);
});
