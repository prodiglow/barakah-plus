import api from "./api";
import { Message } from "../types/userConversation";

// ✅ Base API URL (change if needed)
//const API_URL = `https://barakah-project-be.vercel.app/api/messages`;
const API_URL = "/messages";

/** 📤 Send Message Request */
export interface SendMessageRequest {
  conversationId: string;
  sender: string;
  text?: string;
  audioUrl?: string;
  type: "user" | "adminToScholar" | "scholar" | "adminToUser";
}

/** 📤 Send Message Response */
export interface SendMessageResponse {
  message: string;
  data: Message;
}

/** 💬 Send Message */
export const sendMessage = async (
  messageData: SendMessageRequest
): Promise<SendMessageResponse> => {
  const response = await api.post(`${API_URL}/send`, messageData);
  return response.data;
};
