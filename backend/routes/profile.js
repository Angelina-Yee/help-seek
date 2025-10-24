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
import authMiddleware from "../middleware/auth.js";

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

router.get("/search", authMiddleware, async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const searchQuery = String(req.query.q || "").trim();

    if (!searchQuery) {
      return res.json({
        items: [],
        page,
        limit,
        total: 0,
        hasMore: false,
        searchQuery: "",
      });
    }

    const searchRegex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    const searchConditions = {
      $or: [
        { name: searchRegex },
        { email: searchRegex },
      ],
    };

    const currentUser = await User.findById(req.user.id).select("blockedUsers").lean();
    const blockedUserIds = currentUser?.blockedUsers || [];
    
    if (blockedUserIds.length > 0) {
      searchConditions._id = { $nin: blockedUserIds };
    }

    const [items, total] = await Promise.all([
      User.find(searchConditions)
        .select("_id name avatarCharId avatarColor")
        .sort({ name: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(searchConditions),
    ]);

    const users = items.map(user => ({
      id: String(user._id),
      name: user.name || "User",
      avatarCharId: user.avatarCharId || "raccoon",
      avatarColor: user.avatarColor || "blue",
    }));

    res.json({
      items: users,
      page,
      limit,
      total,
      hasMore: page * limit < total,
      searchQuery,
    });
  } catch (err) {
    next(err);
  }
});

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

// Block user
router.post("/block/:userId", async (req, res, next) => {
  try {
    const currentUserId = getUserIdFromAuth(req);
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user id" });
    }

    if (currentUserId === userId) {
      return res.status(400).json({ error: "Cannot block yourself" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await User.findByIdAndUpdate(
      currentUserId,
      { $addToSet: { blockedUsers: userId } },
      { new: true }
    );

    res.json({ message: "User blocked successfully" });
  } catch (err) {
    next(err);
  }
});

// Unblock user
router.delete("/block/:userId", async (req, res, next) => {
  try {
    const currentUserId = getUserIdFromAuth(req);
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user id" });
    }

    await User.findByIdAndUpdate(
      currentUserId,
      { $pull: { blockedUsers: userId } },
      { new: true }
    );

    res.json({ message: "User unblocked successfully" });
  } catch (err) {
    next(err);
  }
});

router.get("/block-status/:userId", async (req, res, next) => {
  try {
    const currentUserId = getUserIdFromAuth(req);
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user id" });
    }

    const user = await User.findById(currentUserId).select("blockedUsers").lean();
    const isBlocked = user?.blockedUsers?.some(id => String(id) === userId) || false;

    res.json({ isBlocked });
  } catch (err) {
    next(err);
  }
});

// notification preferences
router.get("/notification-preferences", async (req, res, next) => {
  try {
    const userId = getUserIdFromAuth(req);
    const user = await User.findById(userId).select("notificationPreferences").lean();
    
    if (!user) {
      throw createError(404, "User not found");
    }

    res.json({ 
      preferences: user.notificationPreferences || {
        emailNotifications: true
      }
    });
  } catch (err) {
    next(err);
  }
});

// Update notification preferences
router.put("/notification-preferences", [
  body("preferences").isObject().withMessage("Preferences must be an object"),
  body("preferences.emailNotifications").optional().isBoolean().withMessage("Email notifications must be boolean"),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: "Validation failed", 
        details: errors.array() 
      });
    }

    const userId = getUserIdFromAuth(req);
    const { preferences } = req.body;

    const allowedFields = [
      'emailNotifications'
    ];
    
    const invalidFields = Object.keys(preferences).filter(key => !allowedFields.includes(key));
    if (invalidFields.length > 0) {
      return res.status(400).json({ 
        error: `Invalid preference fields: ${invalidFields.join(', ')}` 
      });
    }

    const currentUser = await User.findById(userId).select("notificationPreferences").lean();
    if (!currentUser) {
      throw createError(404, "User not found");
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { 
        $set: { 
          notificationPreferences: {
            ...(currentUser.notificationPreferences || {}),
            ...preferences
          }
        }
      },
      { new: true, select: "notificationPreferences" }
    );

    if (!user) {
      throw createError(404, "User not found");
    }

    res.json({ 
      message: "Notification preferences updated successfully",
      preferences: user.notificationPreferences 
    });
  } catch (err) {
    next(err);
  }
});

export default router;