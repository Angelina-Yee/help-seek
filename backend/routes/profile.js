import express from "express";
import createError from "http-errors";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

const router = express.Router();

router.get("/me", async (req, res, next) => {
  try {
    const hdr = req.headers.authorization || "";
    const token = hdr.startsWith("Bearer ") ? hdr.slice(7).trim() : null;
    if (!token) throw createError(401, "Missing token");

    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const userId = payload.sub || payload.userId || payload.id;
    if (!userId) throw createError(401, "Invalid token");

    const user = await User.findById(userId).lean();
    if (!user) throw createError(404, "User not found");

    res.json({
      name: user.name || "",
      email: user.email,
    });
  } catch (err) {
    next(err);
  }
});

export default router;