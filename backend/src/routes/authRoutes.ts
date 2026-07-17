import express from "express";
import { signup, login, checkUserExists, forgotPassword, resetPassword } from "../controllers/authController";

import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/check-user", checkUserExists);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get("/profile", protect);

export default router;
