import express from "express";
import { applyCoupon } from "../controllers/couponController";

const router = express.Router();

router.post("/apply", applyCoupon);

export default router;
