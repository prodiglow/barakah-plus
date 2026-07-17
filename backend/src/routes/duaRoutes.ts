import express from "express";
import {
  createDua,
  getAllDuas,
  getDuaById,
  updateDua,
  deleteDua,
  toggleDuaStatus,
} from "../controllers/duaController";
import { protectAdmin } from "../middleware/adminMiddleware";

const router = express.Router();

// Public routes (or protected if you want only logged in users to see them, currently public as per requirements usually)
router.get("/", getAllDuas);
router.get("/:id", getDuaById);

// Admin Protected Routes
router.post("/", protectAdmin, createDua);
router.put("/:id", protectAdmin, updateDua);
router.delete("/:id", protectAdmin, deleteDua);
router.patch("/:id/toggle-status", protectAdmin, toggleDuaStatus);

export default router;
