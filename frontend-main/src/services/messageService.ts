import axios from "axios";
import { Message } from "../types/userConversation";

// ✅ Base API URL (change if needed)
const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/messages`;
//const API_URL = "http://localhost:5000/api/messages";

/** 📤 Send Message Request */
export interface SendMessageRequest {
  conversationId: string;
  sender: string;
  text?: string;
  audioUrl?: string;
  type: "user" | "scholar" | "adminToUser" | "adminToScholar";
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
  const response = await axios.post(`${API_URL}/send`, messageData);
  return response.data;
};

