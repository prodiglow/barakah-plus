import express from "express";
import {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController";
import { protectAdmin } from "../middleware/adminMiddleware";

const router = express.Router();

router.route("/")
  .get(getAllCategories)
  .post(protectAdmin, createCategory);

router.route("/:id")
  .put(protectAdmin, updateCategory)
  .delete(protectAdmin, deleteCategory);

export default router;
