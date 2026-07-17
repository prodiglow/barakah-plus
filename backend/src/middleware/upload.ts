import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const ImgStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "BarakahUploads",
  } as any,
});

const audioStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "BarakahAudioUploads",
    resource_type: "video", // ✅ Required for audio!!  
    allowed_formats: ["mp3", "wav", "ogg", "m4a", "aac","webm","mp4"], // ✅ Allowed audio formats
    format: 'mp3', // ✅ Force convert to mp3 for cross-browser support
    public_id: () => `audio_${Date.now()}`, // ✅ Unique ID
  } as any,
});

// ✅ Fix type error by casting storage to any
const uploadImg = multer({ storage: ImgStorage as any });
const uploadAudio = multer({ storage: audioStorage as any });

// Temporary storage for audio processing (before Cloudinary upload)
const tempStorage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, `temp_${file.fieldname}_${Date.now()}_${file.originalname}`);
  }
});
const uploadAudioTemp = multer({ storage: tempStorage });

export default { uploadImg, uploadAudio, uploadAudioTemp };
