import express from "express";
import createError from "http-errors";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

const router = express.Router();

//get user's prfile info: name and email
router.get("/me", async (req, res, next) => {
  try {
    //extract token from authorization header
    const hdr = req.headers.authorization || "";
    const token = hdr.startsWith("Bearer ") ? hdr.slice(7).trim() : null;
    if (!token) throw createError(401, "Missing token");

    //verify token + extract user ID
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const userId = payload.sub || payload.userId || payload.id;
    if (!userId) throw createError(401, "Invalid token");

    //look up user in database
    const user = await User.findById(userId).lean();
    if (!user) throw createError(404, "User not found");

    //return profile info
    res.json({
      name: user.name || "",
      email: user.email,
    });
  } catch (err) {
    next(err);
  }
});

export default router;