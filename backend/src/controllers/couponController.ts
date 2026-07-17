import { Request, Response } from "express";
import Coupon, { ICoupon } from "../models/Coupon";

// Apply coupon
export const applyCoupon = async (req: Request, res: Response) => {
  try {
    const { code, subtotal } = req.body;

    if (!code || !subtotal) {
      return res.status(400).json({ message: "Coupon code and subtotal are required" });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) {
      return res.status(400).json({ message: "Invalid coupon code ❌" });
    }

    if (new Date() > coupon.expiryDate) {
      return res.status(400).json({ message: "Coupon has expired ❌" });
    }

    let discountAmount = 0;
    if (coupon.type === "percentage") {
      discountAmount = subtotal * (coupon.value / 100);
    } else if (coupon.type === "fixed") {
      discountAmount = coupon.value;
    }

    return res.json({
      message: `Coupon applied!`,
      discount: discountAmount,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
