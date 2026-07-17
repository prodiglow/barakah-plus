import api from "./api";

// ✅ Upload audio to Cloudinary
export const uploadAudioToCloudinary = async (file: File, _token: string) => {
  const formData = new FormData();
  formData.append("audio", file);

  const res = await api.post(`/upload-audio`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      // Authorization handled by api interceptor
    },
  });

  return res.data; // contains { message, url, public_id }
};

// ✅ Delete audio from Cloudinary
export const deleteAudioFromCloudinary = async (publicId: string, _token: string) => {
  // api base is /api, so we simply call /delete-audio
  // If the backend expects /api/delete-audio relative to api root, it would be /api/api/delete-audio which seems wrong.
  // Assuming route is /api/delete-audio.
  const res = await api.delete(`/delete-audio`, {
    data: { public_id: publicId },
  });

  return res.data;
};
