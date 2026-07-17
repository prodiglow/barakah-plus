import express from "express";
import { adminLogin, forgotPassword, resetPassword } from "../controllers/adminController";
import { protectAdmin } from "../middleware/adminMiddleware";

const router = express.Router();

router.post("/login", adminLogin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// User Management
import { getAllUsers, updateUserByAdmin, deleteUser } from "../controllers/adminController";
router.get("/users", protectAdmin, getAllUsers);
router.put("/users/:id", protectAdmin, updateUserByAdmin);
router.delete("/users/:id", protectAdmin, deleteUser);

// Review Management
import { getAllReviews, approveReview, rejectReview, getPendingReviewCount } from "../controllers/adminReviewController";
router.get("/reviews", protectAdmin, getAllReviews);
router.get("/reviews/pending-count", protectAdmin, getPendingReviewCount); // ✅ Added
router.put("/reviews/:id/approve", protectAdmin, approveReview);
router.put("/reviews/:id/reject", protectAdmin, rejectReview);

// Platform Testimonials
import { getAllPlatformTestimonials, updatePlatformTestimonialStatus, getPendingPlatformTestimonialCount } from "../controllers/platformTestimonialController";
router.get("/testimonials", protectAdmin, getAllPlatformTestimonials);
router.get("/testimonials/pending-count", protectAdmin, getPendingPlatformTestimonialCount); // ✅ Added
router.put("/testimonials/:id", protectAdmin, updatePlatformTestimonialStatus);

export default router;

