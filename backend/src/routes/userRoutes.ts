import express from "express";
import { getProfile,updateUser } from "../controllers/userController";
import { protect } from "../middleware/userMiddleware";

const router = express.Router();

router.get("/getProfile", protect, getProfile);

router.put("/update/:id", protect,updateUser );

import { submitPlatformTestimonial, getApprovedPlatformTestimonials } from "../controllers/platformTestimonialController";
router.post("/testimonial", protect, submitPlatformTestimonial);
router.get("/testimonials/public", getApprovedPlatformTestimonials);

export default router;
