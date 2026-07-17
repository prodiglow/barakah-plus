// src/services/couponService.ts
import axios from "axios";
import { CouponRequest, CouponResponse } from "../types/Coupon";

//const API_BASE_URL = "http://localhost:5000/api/coupon";
const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/coupon`; 

// ✅ Apply coupon
export const applyCoupon = async (payload: CouponRequest): Promise<CouponResponse> => {
  try {
    const token = localStorage.getItem("token") || "";
    const response = await axios.post<CouponResponse>(
      `${API_BASE_URL}/apply`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      // error.response.data could be the backend error message
      throw error.response.data;
    }
    throw error;
  }
};