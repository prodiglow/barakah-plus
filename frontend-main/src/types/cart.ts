// src/types/cart.ts
import {Order} from "../types/order"
// 🎓 Scholar object returned inside each cart item
export interface Scholar {
  _id: string;
  scholarID: number;
  scholarName: string;
  scholarSpecialization: string[];
  scholarExperience: number;
  scholarEducation: string[];
  rating: number;
  ProfileImg: string;
  reviews: string[];
  fee: number;
  blessings: number;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

/**
 * 🛒 Cart item type (matches backend)
 */
export interface CartItem {
  _id: string;
  userID: string;
  scholarID: Scholar; // ✅ populated object
  name: string;
  motherName: string;
  gender: string;
  contact: string;
  sect: string;
  reason: string;
  language: string;
  message: string;
  service: string;
  fee: number;
  status: string;
  audioUrl?: string;
  quranKhawaniDate?: string;
  quranKhawaniTimeSlot?: string;
  featureOnHomePage?: boolean;
  selectWazifa?: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

/**
 * 📦 Full API response type for getUserCart
 */
export interface CartResponse {
  success: boolean;
  data: CartItem[];
}

/**
 * 💅 UI-friendly cart item type for FE components
 */
export interface UICartItem {
  id: string;
  title: string;
  reason: string;
  price: number;
  image: string;
}

export interface MoveCartToOrderRequest {
  userID: string;
}

export interface MoveCartToOrderResponse {
  success: boolean;
  message: string;
  data?: Order[];
}
