import api from "./api";
import { Order } from "../types/order";

const API_URL = "/orders"; 




/** 🌱 Create Order */
export const createOrder = async (orderData: Order) => {
  const response = await api.post(API_URL, orderData);
  return response.data;
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

/** 🔔 Get Pending Admin Review Count */
export const getPendingAdminReviewCount = async () => {
    const response = await api.get(`${API_URL}/pending-admin-reviews`);
    return response.data; // { count: number }
};

/** 🔔 Get In Progress by Scholar Count */
export const getInProgressByScholarCount = async () => {
    const response = await api.get(`${API_URL}/in-progress-scholar-orders`);
    return response.data; // { count: number }
};

/** 🔔 Get Scholar Submitted Count */
export const getScholarSubmittedCount = async () => {
    const response = await api.get(`${API_URL}/scholar-submitted-orders`);
    return response.data; // { count: number }
};