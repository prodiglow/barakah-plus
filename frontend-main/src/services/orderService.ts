import api from "./api";
import axios from "axios";
import { Order } from "../types/order";

const API_URL = "/orders"; 




/** 🌱 Create Order */
export const createOrder = async (orderData: Order, _token?: string) => {
  try {
    const response = await api.post(API_URL, orderData);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("❌ Backend Error Response:", error.response?.data);
      console.error("❌ Request Payload failed serialization or validation");
    }
    throw error;
  }
};

/** 📋 Get All Orders */
export const getAllOrders = async () => {
  const response = await api.get(API_URL);
  return response.data;
};

/** 🔍 Get Single Order */
export const getOrderById = async (id: string) => {
  const response = await api.get(`${API_URL}/${id}`);
  return response.data;
};

/** ✏️ Update Order */
export const updateOrder = async (id: string, data: Partial<Order>) => {
  const response = await api.put(`${API_URL}/${id}`, data);
  return response.data;
};

/** 🗑️ Delete Order */
export const deleteOrder = async (id: string) => {
  const response = await api.delete(`${API_URL}/${id}`);
  return response.data;
};

// ✅ Get orders by userId
export const getOrdersByUserId = async (userId: string): Promise<Order[]> => {
  const res = await api.get(`${API_URL}/user/${userId}`);
  return res.data;
};

/** 🔍 Check if user has zero amount order */
export const checkZeroAmountOrder = async (userId: string): Promise<number> => {
  const response = await api.get(`${API_URL}/user/${userId}/check-zero-amount`);
  return response.data;
};

/** ⭐ Submit Order Feedback */
export const submitFeedback = async (id: string, rating: number, comment: string, scholarId?: string) => {
  const response = await api.post(`${API_URL}/${id}/feedback`, { rating, comment, scholarId });
  return response.data;
};

/** ➕ Increment Feedback Popup Count */
export const incrementPopupCount = async (id: string) => {
  const response = await api.post(`${API_URL}/${id}/increment-popup`);
  return response.data;
};

/** ➕ Increment Platform Feedback Popup Count */
export const incrementPlatformPopupCount = async (id: string) => {
  const response = await api.post(`${API_URL}/${id}/increment-platform-popup`);
  return response.data;
};

/** 🛑 Max Out Feedback Popup Count (Set to 3) */
export const maxPopupCount = async (id: string) => {
  const response = await api.post(`${API_URL}/${id}/max-popup`);
  return response.data;
};

/** 🔔 Get Unread Completed Count */
export const getUnreadCompletedCount = async (userId: string) => {
  const response = await api.get(`${API_URL}/user/${userId}/unread-completed`);
  return response.data; // { count: number }
};

/** ✅ Mark Completed Orders Read */
export const markCompletedOrdersRead = async (userId: string) => {
  const response = await api.put(`${API_URL}/user/${userId}/mark-completed-read`);
  return response.data;
};

/** ✅ Mark Single Order Read */
export const markOrderRead = async (id: string) => {
  const response = await api.put(`${API_URL}/${id}/mark-read`);
  return response.data;
};
