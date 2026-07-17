import express from "express";
import { addUserCard, getUserCards, deleteUserCard } from "../controllers/userCardsController";

const router = express.Router();

// ➕ Add new card
router.post("/", addUserCard);

// 📋 Get all cards for a user
router.get("/:userID", getUserCards);

// ❌ Delete a specific card
router.delete("/:id", deleteUserCard);

export default router;
