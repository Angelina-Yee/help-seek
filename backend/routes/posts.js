import express from "express";
import { body, validationResult } from "express-validator";
import auth from "../middleware/auth.js";
import { upload } from "../utils/upload.js";
import { Post } from "../models/Post.js";

const router = express.Router();

// Create a new post
router.post(
  "/",
  auth,
  upload.single("image"),
  [
    body("type").isIn(["loss", "find"]).withMessage("type must be loss|find"),
    body("title").trim().notEmpty(),
    body("location").trim().notEmpty(),
    body("objectCategory").trim().notEmpty(),
    body("description").trim().notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: "Validation failed", errors: errors.array() });

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    const doc = await Post.create({
      userId: req.user.id,
      type: req.body.type,
      title: req.body.title,
      location: req.body.location,
      objectCategory: req.body.objectCategory,
      description: req.body.description,
      imageUrl,
    });

    res.status(201).json(doc);
  }
);

// Get current user's posts
router.get("/me", auth, async (req, res) => {
  const posts = await Post.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean();
  res.json(posts);
});

export default router;
