import express from "express";
import multer from "multer";
import { ImageAnnotatorClient } from "@google-cloud/vision";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const visionClient = new ImageAnnotatorClient();

router.post("/identify-item", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded." });
    }

    const [result] = await visionClient.labelDetection(req.file.buffer);
    const labels = result.labelAnnotations;

    if (labels && labels.length > 0) {
      res.json({ labels: labels });
    } else {
      res.json({ itemName: "Could not identify item" });
    }
  } catch (error) {
    console.error("Error calling Vision API:", error);
    next(error);
  }
});

export default router;
