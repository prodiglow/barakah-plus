import api from "./api";
import { OrdersWithUserConversationsResponse } from "../types/userConversation";

const API_URL = "/user-chat";

/** 📋 Get All Orders with User Conversations */
export const getAllOrdersWithConversations = async (): Promise<OrdersWithUserConversationsResponse> => {
  const response = await api.get(`${API_URL}/all`);
  return response.data;
};

/** 🎵 Upload Audio File */
export interface UploadAudioResponse {
  message: string;
  url: string;
  public_id: string;
}

export const uploadAudio = async (audioFile: File | Blob): Promise<UploadAudioResponse> => {
  const formData = new FormData();
  
  // Convert Blob to File if needed (for recorded audio)
  if (audioFile instanceof Blob && !(audioFile instanceof File)) {
    const file = new File([audioFile], 'recording.webm', { type: 'audio/webm' });
    formData.append('audio', file);
  } else {
    formData.append('audio', audioFile);
  }

  const response = await api.post(`/upload-audio`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

