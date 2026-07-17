import express from "express";
import {
  addTestimonial,
  getAllTestimonials,
  getScholarTestimonials,
  approveTestimonial,
  deleteTestimonial,
} from "../controllers/testimonialController";

const router = express.Router();

router.post("/", addTestimonial); // ➕ Add testimonial
router.get("/", getAllTestimonials); // 📋 Get all
router.get("/:scholarID", getScholarTestimonials); // 🎓 Get by scholar
router.put("/approve/:id", approveTestimonial); // ✅ Approve
router.delete("/:id", deleteTestimonial); // ❌ Delete

export default router;
