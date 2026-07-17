import axios from "axios";
import {
  OrdersWithUserConversationsResponse,
  UserChatResponse,
  UserConversationsResponse,
} from "../types/userConversation";

// ✅ Base API URL (change if needed)
const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/user-chat`;
//const API_URL = "http://localhost:5000/api/user-chat";

// ✅ Upload API URL
const UPLOAD_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;
//const UPLOAD_API_URL = "http://localhost:5000/api";

/** 📋 Get All Orders with User Conversations */
export const getAllOrdersWithConversations = async (): Promise<OrdersWithUserConversationsResponse> => {
  const response = await axios.get(`${API_URL}/all`);
  return response.data;
};

/** 💬 Get User Chat from Relevant Order */
export const getUserChat = async (
  orderId: string,
  userId?: string
): Promise<UserChatResponse> => {
  const params = userId ? { userId } : {};
  const response = await axios.get(`${API_URL}/${orderId}`, { params });
  return response.data;
};

/** 📋 Get All Conversations for All Orders of a User */
export const getUserConversations = async (
  userId: string
): Promise<UserConversationsResponse> => {
  const response = await axios.get(`${API_URL}/user/${userId}`);
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

  const response = await axios.post(`${UPLOAD_API_URL}/upload-audio`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

