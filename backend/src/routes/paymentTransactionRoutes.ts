import { Router } from "express";
import {
  savePaymentTransaction,
  getUserPaymentTransactions,
  getPaymentTransactionById,
  getAllPaymentTransactions,
} from "../controllers/paymentTransactionController";

const router = Router();

/**
 * @route   POST /api/payment-transactions
 * @desc    Save a payment transaction (JazzCash response)
 */
router.post("/", savePaymentTransaction);

/**
 * @route   GET /api/payment-transactions/all
 * @desc    Get all payment transactions (admin)
 */
router.get("/all", getAllPaymentTransactions);

/**
 * @route   GET /api/payment-transactions/detail/:id
 * @desc    Get a single payment transaction by ID
 */
router.get("/detail/:id", getPaymentTransactionById);

/**
 * @route   GET /api/payment-transactions/:userID
 * @desc    Get all payment transactions for a user
 */
router.get("/:userID", getUserPaymentTransactions);

export default router;
