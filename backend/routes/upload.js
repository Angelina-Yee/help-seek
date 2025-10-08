import express from "express";
import { uploadImage } from "../utils/upload.js";
import requireAuth from "../middleware/auth.js";
import cloudinary from "../utils/cloudinary.js";

const router = express.Router();

function uploadBufferToCloudinary(buffer, { folder = "helpnseek/uploads", filename } = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        public_id: filename ? filename.replace(/\.[^.]+$/, "") : undefined,
      },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
}

router.post("/", requireAuth, uploadImage.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const result = await uploadBufferToCloudinary(req.file.buffer, {
      filename: req.file.originalname,
    });

    res.json({ url: result.secure_url });
  } catch (err) {
    console.error("Cloudinary upload failed:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

export default router;
