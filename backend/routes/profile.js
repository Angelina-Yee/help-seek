import express from "express";
import createError from "http-errors";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { body, validationResult } from "express-validator";
import { User, USER_ENUMS } from "../models/User.js";
import { Post } from "../models/Post.js";
import Thread from "../models/Thread.js";
import Message from "../models/Message.js";

const router = express.Router();

function getAccessToken(req) {
  const hdr = req.headers.authorization || "";
  const bearer = hdr.startsWith("Bearer ") ? hdr.slice(7).trim() : null;
  if (bearer) return bearer;

  const cookieHeader = req.headers.cookie || "";
  if (!cookieHeader) return null;

  const cookies = Object.fromEntries(
    cookieHeader
      .split(";")
      .map((c) => {
        const i = c.indexOf("=");
        if (i === -1) return [c.trim(), ""];
        return [c.slice(0, i).trim(), decodeURIComponent(c.slice(i + 1))];
      })
      .filter(([k]) => k)
  );
  return cookies.access_token || cookies.token || null;
}

// Get user id from Bearer token
function getUserIdFromAuth(req) {
  const token = getAccessToken(req);
  if (!token) throw createError(401, "Missing token");

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch {
    throw createError(401, "Invalid or expired token");
  }

  const userId = payload.sub || payload.userId || payload.id;
  if (!userId) throw createError(401, "Invalid token");
  return userId;
}

//Get user's prfile info
router.get("/me", async (req, res, next) => {
  try {
    const userId = getUserIdFromAuth(req);
    const user = await User.findById(userId).lean();
    if (!user) throw createError(404, "User not found");

    //Return profile info
    res.json({
      id: String(user._id),
      name: user.name || "",
      email: user.email,
      college: user.college || null,
      year: user.year || null,
      avatarCharId: user.avatarCharId || "raccoon",
      avatarColor: user.avatarColor || "blue",
    });
  } catch (err) {
    next(err);
  }
});

//Update user's profile info
router.patch(
  "/me",
  
  //Input validation
  body("name").optional().isString().isLength({ min: 1, max: 80 }),
  body("college").optional().isIn(USER_ENUMS.COLLEGES),
  body("year").optional().isIn(USER_ENUMS.YEARS),
  body("avatarCharId").optional().isIn(USER_ENUMS.AVATAR_CHAR),
  body("avatarColor").optional().isIn(USER_ENUMS.AVATAR_COLOR),

  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) 
        throw createError(400, { errors: errors.array() });

      const userId = getUserIdFromAuth(req);

      // Build update object
      const update = {};
      if (typeof req.body.name === "string") update.name = req.body.name.trim();
      if (typeof req.body.college === "string") update.college = req.body.college;
      if (typeof req.body.year === "string") update.year = req.body.year;
      if (typeof req.body.avatarCharId === "string") update.avatarCharId = req.body.avatarCharId;
      if (typeof req.body.avatarColor === "string") update.avatarColor = req.body.avatarColor;

      // Save updated profile
      const user = await User.findByIdAndUpdate(
        userId,
        { $set: update },
        { new: true, runValidators: true, lean: true }
      );
      if (!user) throw createError(404, "User not found");

      // Return updated profile info
      res.json({
        message: "Profile updated",
        id: String(user._id),
        name: user.name || "",
        email: user.email,
        college: user.college || null,
        year: user.year || null,
        avatarCharId: user.avatarCharId || "raccoon",
        avatarColor: user.avatarColor || "blue",
      });
    } catch (err) {
      next(err);
    }
  }
);

// Update user's avatar
router.patch(
  "/me/avatar",
  body("charId").isString().custom((v) => USER_ENUMS.AVATAR_CHAR.includes(v)),
  body("color").isString().custom((v) => USER_ENUMS.AVATAR_COLOR.includes(v)),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(createError(400, "Invalid avatar selection"));
      }

      const userId = getUserIdFromAuth(req);
      const { charId, color } = req.body;

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: { avatarCharId: charId, avatarColor: color } },
        { new: true, runValidators: true, lean: true }
      );
      if (!user) throw createError(404, "User not found");

      res.json({
        avatarCharId: user.avatarCharId,
        avatarColor: user.avatarColor,
      });
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  "/me",
  body("password").isString().isLength({ min: 1 }),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw createError(400, "Password is required");
      }

      const userId = getUserIdFromAuth(req);
      const { password } = req.body;
      
      const user = await User.findById(userId);
      if (!user) throw createError(404, "User not found");

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        throw createError(401, "Incorrect password");
      }

      await Post.deleteMany({ user: userId });
      await Thread.deleteMany({ participants: userId });
      await Message.deleteMany({ sender: userId });
      await User.findByIdAndDelete(userId);

      res.clearCookie("access_token");
      res.clearCookie("token");

      res.json({ 
        message: "Account deleted successfully",
        deletedAt: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid user id" });
    }

    const user = await User.findById(id)
      .select("_id name avatarCharId avatarColor")
      .lean();

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      id: String(user._id),
      name: user.name || "User",
      avatarCharId: user.avatarCharId || "raccoon",
      avatarColor: user.avatarColor || "blue",
    });
  } catch (err) {
    next(err);
  }
});

export default router;