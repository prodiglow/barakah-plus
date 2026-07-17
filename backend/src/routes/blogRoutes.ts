import express from "express";
import {
  createBlog,
  getAllBlogs,
  getBlogById,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
  toggleFeatured,
  togglePublished,
} from "../controllers/blogController";

const router = express.Router();

// CRUD Routes
router.post("/insert", createBlog);
router.get("/", getAllBlogs);
router.get("/slug/:slug", getBlogBySlug);
router.get("/:id", getBlogById);
router.put("/update/:id", updateBlog);
router.delete("/delete/:id", deleteBlog);
router.patch("/toggle-featured/:id", toggleFeatured);
router.patch("/toggle-published/:id", togglePublished);

export default router;
