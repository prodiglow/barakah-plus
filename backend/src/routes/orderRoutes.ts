import express from "express";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  getOrdersByUserId,
  checkZeroAmountOrder,
  getOrdersByScholarId,
  submitFeedback,
  incrementPopupCount,
  checkPendingAdminReviewCount,
  checkInProgressByScholarCount,
  checkScholarSubmittedCount,
  getUnreadCompletedCount,
  markAllCompletedRead,
  maxPopupCount,
  incrementPlatformPopupCount,
  markOrderRead // ✅ Added import
} from "../controllers/orderController";
import { protect } from "../middleware/userMiddleware";
import { protectAdmin } from "../middleware/adminMiddleware";

const router = express.Router();

// User routes
router.post("/", protect, createOrder);
router.get("/user/:userId/check-zero-amount", protect, checkZeroAmountOrder);
router.get("/user/:userId", protect, getOrdersByUserId);
router.get("/user/:userId/unread-completed", protect, getUnreadCompletedCount);
router.put("/user/:userId/mark-completed-read", protect, markAllCompletedRead);

// Public scholar report route
router.get("/scholar/:scholarId", getOrdersByScholarId);

// Admin routes
router.get("/", protectAdmin, getAllOrders);
router.get("/pending-admin-reviews", protectAdmin, checkPendingAdminReviewCount);
router.get("/in-progress-scholar-orders", protectAdmin, checkInProgressByScholarCount);
router.get("/scholar-submitted-orders", protectAdmin, checkScholarSubmittedCount);
// Notification routes

// Feedback routes
// Feedback routes
router.post("/:id/feedback", protect, submitFeedback);
router.post("/:id/increment-popup", protect, incrementPopupCount);
router.post("/:id/increment-platform-popup", protect, incrementPlatformPopupCount); // ✅ Added route
router.post("/:id/max-popup", protect, maxPopupCount);
router.put("/:id/mark-read", protect, markOrderRead); // ✅ New route for user to mark single order read

// General order management
router.get("/:id", getOrderById); // Users can view their own, admins can view all (handled in controller logic usually, or just protect for now)
router.put("/:id", protect, updateOrder); // Allow users to update their own orders (and Admins)
router.delete("/:id", protectAdmin, deleteOrder);
export default router;
