import express from "express";
import createError from "http-errors";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import { User, USER_ENUMS } from "../models/User.js";

const router = express.Router();

//helper: get user id from Bearer token
function getUserIdFromAuth(req) {
  const hdr = req.headers.authorization || "";
  const token = hdr.startsWith("Bearer ") ? hdr.slice(7).trim() : null;
  if (!token) throw createError(401, "Missing token");
  const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  const userId = payload.sub || payload.userId || payload.id;
  if (!userId) throw createError(401, "Invalid token");

  return userId;
}

//Get user's prfile info
router.get("/me", async (req, res, next) => {
  try {
    //Fetch user from DB
    const userId = getUserIdFromAuth(req);
    const user = await User.findById(userId).lean();
    if (!user) throw createError(404, "User not found");

    //Return profile info
    res.json({
      name: user.name || "",
      email: user.email,
      college: user.college || null,
      year: user.year || null
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

  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw createError(400, { errors: errors.array() });

      const userId = getUserIdFromAuth(req);

      // Build update object
      const update = {};
      if (typeof req.body.name === "string") update.name = req.body.name.trim();
      if (typeof req.body.college === "string") update.college = req.body.college;
      if (typeof req.body.year === "string") update.year = req.body.year;

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
        name: user.name || "",
        email: user.email,
        college: user.college || null,
        year: user.year || null,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;