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

// Validate post type
const norm = (v) => {
  const s = (v ?? "").toString().trim().toLowerCase();
  if (s === "find") return "find";
  if (s === "loss" || s === "lost") return "loss";
  return null;
};

// Create Post
async function createPost(req, res, next, forcedType = null) {
  try {
    const type =
      forcedType ??
      norm(
        req.body?.type ??
          req.body?.postType ??
          req.body?.kind ??
          req.query?.type ??
          req.query?.postType ??
          ""
      );

    const { title, location, objectCategory, description } = req.body;

    if (!type)
      throw createError(400, "Invalid or missing post 'type' (loss | find)");
    if (!title || !location || !objectCategory || !description) {
      throw createError(400, "Missing required fields");
    }

    let imageUrl, imagePublicId;
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

    // Debug: verifying saved type post
    console.log(
      "[POST /api/posts*]",
      {
        forcedType,
        bodyType: req.body?.type,
        postType: req.body?.postType,
        queryType: req.query?.type,
      },
      "=> saved:",
      post.type
    );

    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
}
// Find route
router.post("/find", auth, uploadImage.single("image"), (req, res, next) =>
  createPost(req, res, next, "find")
);

// Loss route
router.post("/loss", auth, uploadImage.single("image"), (req, res, next) =>
  createPost(req, res, next, "loss")
);

router.post("/", auth, uploadImage.single("image"), (req, res, next) =>
  createPost(req, res, next, null)
);

router.get("/", async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      50,
      Math.max(1, parseInt(req.query.limit, 10) || 20)
    );

    const q = {};
    const t = String(req.query.type || "")
      .toLowerCase()
      .trim();
    if (t === "loss" || t === "find") q.type = t;

    const [items, total] = await Promise.all([
      Post.find(q)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("user", "name avatarCharId avatarColor")
        .lean(),
      Post.countDocuments(q),
    ]);

    res.json({
      items,
      page,
      limit,
      total,
      hasMore: page * limit < total,
    });
  } catch (err) {
    next(err);
  }
});

// Get posts of logged user
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

// Resolve or unresolve post
router.patch("/:id/resolve", auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { resolved } = req.body;

    const post = await Post.findById(id);
    if (!post) throw createError(404, "Post not found");
    if (post.user.toString() !== req.user.id)
      throw createError(403, "Forbidden");

    post.resolved = !!resolved;
    post.resolvedAt = post.resolved ? new Date() : null;
    await post.save();

    res.json({ ok: true, post });
  } catch (err) {
    next(err);
  }
});

// Delete post
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
      } catch (_) {}
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

// User stats
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
