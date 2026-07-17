// src/services/cartService.ts
import api from "./api";
import axios from "axios";
import { CartResponse,CartItem } from "../types/cart";
import { AddToCartPayload } from "../types/AddToCartPayload";
import { MoveCartToOrderRequest,MoveCartToOrderResponse } from "../types/cart";

const API_BASE_URL = "/cart";


/**
 * 🛒 Add item to cart
 */
export const addToCart = async (cartData: AddToCartPayload) => {
  const response = await api.post(`${API_BASE_URL}/`, cartData);
  return response.data;
};

/**
 * 📦 Get all items in a user's cart
 */
export const getUserCart = async (userID: string): Promise<CartResponse>  => {
  const response = await api.get(`${API_BASE_URL}/${userID}`);
  return response.data;
};

/**
 * ❌ Remove item from cart
 */
export const removeFromCart = async (id: string) => {
  const response = await api.delete(`${API_BASE_URL}/${id}`);
  return response.data;
};

/**
 * 🔄 Update item in cart
 */
export const updateCartItem = async (id: string, updatedData: Partial<CartItem>) => {
  const response = await api.put(`${API_BASE_URL}/${id}`, updatedData);
  return response.data;
};

/**
 * 🧹 Clear all items in a user's cart
 */
export const clearUserCart = async (userID: string) => {
  const response = await api.delete(`${API_BASE_URL}/clear/${userID}`);
  return response.data;
};

export const moveCartToOrder = async (
  payload: MoveCartToOrderRequest
): Promise<MoveCartToOrderResponse> => {
  try {
    const response = await api.post(`${API_BASE_URL}/move-to-order`, payload);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to move cart to order");
    }
    throw error;
  }
};
