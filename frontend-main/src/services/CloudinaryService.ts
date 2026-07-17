// src/services/CloudinaryService.ts
import api from "./api";

const API_BASE_URL = ""; 

// ✅ Extract Cloudinary public ID from stored URL
export const getPublicIdFromUrl = (url: string): string => {
  if (!url) return "";
  const parts = url.split("/upload/");
  if (parts.length < 2) return "";
  const withoutVersion = parts[1].replace(/^v\d+\//, "");
  return withoutVersion.replace(/\.[^/.]+$/, "");
};

// ✅ Upload image to Cloudinary
export const uploadToCloudinary = async (file: File, _token?: string) => {
  const formData = new FormData();
  formData.append("image", file);

  const headers: Record<string, string> = {
    "Content-Type": "multipart/form-data",
  };
  
  const res = await api.post(`${API_BASE_URL}/upload`, formData, {
    headers,
  });

  return res.data.url; // ✅ Return Cloudinary URL
};

// ✅ Delete image from Cloudinary
export const deleteFromCloudinary = async (publicId: string, _token: string) => {
  return await api.delete(`${API_BASE_URL}/delete`, {
    data: { public_id: publicId },
  });
};
