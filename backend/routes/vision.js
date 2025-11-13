import express from "express";
import multer from "multer";
import { ImageAnnotatorClient } from "@google-cloud/vision";
import { readFileSync } from "fs";
import path from "path";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

let visionClient;
try {
  const encoded = process.env.GOOGLE_CREDENTIALS_B64;
  let raw;

  if (encoded) {
    raw = Buffer.from(encoded, "base64").toString("utf8");
  } else {
    const credentialsPath = path.join(process.cwd(), "google-credentials.json");
    raw = readFileSync(credentialsPath, "utf8");
  }

  const credentials = JSON.parse(raw);

  visionClient = new ImageAnnotatorClient({
    credentials: credentials,
    projectId: credentials.project_id,
  });
  console.log("Vision API client initialized successfully");
} catch (error) {
  console.error("Failed to initialize Vision API client:", error.message);
  if (!process.env.GOOGLE_CREDENTIALS_B64) {
    console.error(
      "Set GOOGLE_CREDENTIALS_B64 environment variable with base64-encoded credentials for production deployments."
    );
  }

  visionClient = null;
}

router.post("/identify-item", upload.single("file"), async (req, res, next) => {
  try {
    if (!visionClient) {
      return res.status(500).json({
        success: false,
        error: "Vision API not properly configured",
      });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded." });
    }

    const [result] = await visionClient.labelDetection(req.file.buffer);
    const labels = result.labelAnnotations;

    if (labels && labels.length > 0) {
      res.json({
        success: true,
        labels: labels,
        itemName: labels[0].description,
      });
    } else {
      res.json({
        success: false,
        labels: [],
        itemName: "Could not identify item",
      });
    }
  } catch (error) {
    console.error("Error calling Vision API:", error);
    res.status(500).json({
      success: false,
      error: "Failed to process image",
    });
  }
});

export default router;
