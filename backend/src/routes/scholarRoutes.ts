import express from "express";
import { 
  getAllScholars,
  getScholarById,
  createScholar,
  updateScholar,
  deleteScholar
} from "../controllers/scholarController";
import { protectAdmin } from "../middleware/adminMiddleware";

const router = express.Router();

router.get("/", getAllScholars);
router.get("/:scholarID", getScholarById);
router.post("/", protectAdmin, createScholar);
router.put("/:id", protectAdmin, updateScholar);
router.delete("/:id", protectAdmin, deleteScholar);

export default router;
