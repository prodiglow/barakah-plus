import express from "express";
import { getScholarChat } from "../controllers/scholarChatController";

const router = express.Router();

router.get("/:orderId", getScholarChat);

export default router;

