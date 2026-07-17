import express from "express";
import { getPaymentStats } from "../controllers/paymentController";

const router = express.Router();

router.get("/stats", getPaymentStats);

export default router;
