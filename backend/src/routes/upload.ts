import express from "express";
import Upload from "../middleware/upload"; // your multer-cloudinary middleware
import { v2 as cloudinary } from "cloudinary";
import { protectAny } from "../middleware/authMiddleware";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import fs from "fs";
import path from "path";

// Set ffmpeg path
if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath);
}

const router = express.Router();

// Quick health check endpoint to test if Vercel functions respond fast
router.get("/ping", (req, res) => {
  res.send("pong");
});

router.post("/upload", protectAny, Upload.uploadImg.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const imageUrl = (req.file as any).path; // or req.file.path

  res.json({
    message: "Image uploaded successfully!",
    url: imageUrl,
  });
});

router.delete("/delete", protectAny, async (req, res) => {
  const { public_id } = req.body;
  if (!public_id) {
    return res.status(400).json({ message: "No public_id provided" });
  }

  try {
    const result = await cloudinary.uploader.destroy(public_id);
    res.json({
      message: "Image deleted successfully!",
      result,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to delete image", error: error.message || error });
  }
});

// Audio upload route
router.post("/upload-audio", Upload.uploadAudioTemp.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No audio file uploaded" });
    }

    const inputPath = req.file.path;
    const outputPath = path.join(path.dirname(inputPath), `converted_${Date.now()}.mp3`);

    // Convert to MP3
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .toFormat("mp3")
        .on("end", resolve)
        .on("error", reject)
        .save(outputPath);
    });

    console.log("Audio converted successfully:", outputPath);

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(outputPath, {
      resource_type: "video",
      folder: "BarakahAudioUploads",
      public_id: `audio_${Date.now()}`,
      format: "mp3" 
    });

    // Cleanup temp files
    try {
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
    } catch (cleanupError) {
        console.error("Cleanup Error:", cleanupError);
    }

    res.json({
      message: "Audio uploaded successfully!",
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    console.error("Upload Audio Error:", error); 
    
    // Cleanup input file if it exists and conversion failed
    if (req.file && fs.existsSync(req.file.path)) {
        try {
            fs.unlinkSync(req.file.path);
        } catch (e) { console.error("Failed to delete temp input", e); }
    }

    return res.status(500).json({
      message: "Audio upload failed ❌",
      error: error instanceof Error ? error.message : error,
    });
  }
});


// Audio delete route
router.delete("/delete-audio", protectAny, async (req, res) => {
  const { public_id } = req.body;
  if (!public_id) {
    return res.status(400).json({ message: "No public_id provided" });
  }

  try {
    const result = await cloudinary.uploader.destroy(public_id, { resource_type: "video" }); // Audio files use "video" resource type
    res.json({
      message: "Audio deleted successfully!",
      result,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ message: "Failed to delete audio", error: errorMessage });
  }
});

export default router;
