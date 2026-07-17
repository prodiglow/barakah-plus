// src/types/Coupon.ts

export interface CouponRequest {
  code: string;
  subtotal: number;
}

export interface CouponResponse {
  message: string;
  discount: number;
  code: string;
  type: "percentage" | "fixed";
  value: number; // percentage value or fixed amount
}
