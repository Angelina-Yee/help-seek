import express from "express";
import createError from "http-errors";
import streamifier from "streamifier";
import auth from "../middleware/auth.js";
import { uploadImage } from "../utils/upload.js";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/Post.js";
import { User } from "../models/User.js";

const router = express.Router();

// Upload to Cloudinary
function uploadBufferToCloudinary(buffer, originalname) {
  return new Promise((resolve, reject) => {
    const publicIdBase = originalname
      ? originalname.replace(/\.[^.]+$/, "")
      : `post_${Date.now()}`;

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "help-seek/posts",
        resource_type: "image",
        public_id: publicIdBase,
      },
      (err, result) => (err ? reject(err) : resolve(result))
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
}

// Create a post (loss/find)
router.post("/", auth, uploadImage.single("image"), async (req, res, next) => {
  try {
    // normalize incoming type to prevent casing/spacing issues
    const typeRaw = (req.body.type ?? "").toString().trim().toLowerCase();
    const type = typeRaw === "find" ? "find" : typeRaw === "loss" ? "loss" : null;

    const { title, location, objectCategory, description } = req.body;

    if (!type) {
      throw createError(400, "Invalid or missing post 'type' (loss | find)");
    }
    if (!title || !location || !objectCategory || !description) {
      throw createError(400, "Missing required fields");
    }

    let imageUrl = undefined;
    let imagePublicId = undefined;

    if (req.file?.buffer) {
      const result = await uploadBufferToCloudinary(
        req.file.buffer,
        req.file.originalname
      );
      imageUrl = result.secure_url;
      imagePublicId = result.public_id;
    }

    const post = await Post.create({
      user: req.user.id,
      type,
      title,
      location,
      objectCategory,
      description,
      imageUrl,
      imagePublicId,
    });

    // debug line; safe to remove after verifying
    console.log("[POST /api/posts] received:", req.body.type, "=> saved:", post.type);

    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
});

// Get posts
router.get("/me", auth, async (req, res, next) => {
  try {
    const posts = await Post.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .lean();
    res.json(posts);
  } catch (err) {
    next(err);
  }
});

//Delete a post + remove image from Cloudinary
router.delete("/:id", auth, async (req, res, next) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, user: req.user.id });
    if (!post) throw createError(404, "Post not found");

    if (post.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(post.imagePublicId, {
          resource_type: "image",
          invalidate: true,
        });
      } catch (_) {
      }
    }

    await post.deleteOne();

    await User.updateOne(
      { _id: req.user.id },
      { $inc: { resolvedCount: 1 } },
      { upsert: false }
    );

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// Get stats (finds/losses + resolved count)
router.get("/stats", auth, async (req, res, next) => {
  try {
    const [finds, losses] = await Promise.all([
      Post.countDocuments({ user: req.user.id, type: "find" }),
      Post.countDocuments({ user: req.user.id, type: "loss" }),
    ]);

    const user = await User.findById(req.user.id).lean();
    const resolved = user?.resolvedCount ?? 0;

    res.json({ finds, losses, resolved });
  } catch (err) {
    next(err);
  }
});

export default router;
