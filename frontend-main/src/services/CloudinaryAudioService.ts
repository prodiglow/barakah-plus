import api from "./api";

const API_BASE_URL = "";

// ✅ Upload audio to Cloudinary
export const uploadAudioToCloudinary = async (file: File, _token: string) => {
  const formData = new FormData();
  formData.append("audio", file);

  const res = await api.post(`${API_BASE_URL}/upload-audio`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data; // contains { message, url, public_id }
};

// ✅ Delete audio from Cloudinary
export const deleteAudioFromCloudinary = async (publicId: string, _token: string) => {
  const res = await api.delete(`${API_BASE_URL}/delete-audio`, {
    data: { public_id: publicId },
  });

  return res.data;
};
