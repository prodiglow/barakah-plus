// src/services/CloudinaryService.ts
import api from "./api";


// ✅ Extract Cloudinary public ID from stored URL
export const getPublicIdFromUrl = (url: string): string => {
  if (!url) return "";
  const parts = url.split("/upload/");
  if (parts.length < 2) return "";
  const withoutVersion = parts[1].replace(/^v\d+\//, "");
  return withoutVersion.replace(/\.[^/.]+$/, "");
};

// ✅ Upload image to Cloudinary
export const uploadToCloudinary = async (file: File, _token: string) => {
  const formData = new FormData();
  formData.append("image", file);

  const res = await api.post(`/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data.url; // ✅ Return Cloudinary URL
};

// ✅ Delete image from Cloudinary
export const deleteFromCloudinary = async (publicId: string, _token: string) => {
  return await api.delete(`/delete`, {
    data: { public_id: publicId },
  });
};

// ✅ Upload Audio to Cloudinary
export const uploadAudioToCloudinary = async (file: File, _token: string) => {
  const formData = new FormData();
  formData.append("audio", file);

  const res = await api.post(`/upload-audio`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data; // Returns { message, url, public_id }
};

// ✅ Delete Audio from Cloudinary
export const deleteAudioFromCloudinary = async (publicId: string, _token: string) => {
  return await api.delete(`/delete-audio`, {
    data: { public_id: publicId },
  });
};
