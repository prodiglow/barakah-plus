import express from "express";
import { getUserChat, getUserConversations, getAllOrdersWithConversations } from "../controllers/userChatController";

const router = express.Router();

router.get("/all", getAllOrdersWithConversations);
router.get("/user/:userId", getUserConversations);
router.get("/:orderId", getUserChat);

export default router;

