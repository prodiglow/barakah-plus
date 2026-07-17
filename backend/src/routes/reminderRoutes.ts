import express from "express";
import {
  createReminder,
  getAllReminders,
  getReminderById,
  getRemindersByOrderId,
  updateReminder,
  incrementReminderCount,
  deleteReminder,
} from "../controllers/reminderController";

const router = express.Router();

// ➕ Create a new reminder
router.post("/", createReminder);

// 📋 Get all reminders
router.get("/", getAllReminders);

// 📋 Get reminders by OrderID (must be before /:id route)
router.get("/order/:orderID", getRemindersByOrderId);

// 🔢 Increment reminder count (must be before /:id route)
router.patch("/:id/increment", incrementReminderCount);

// 📄 Get reminder by ID
router.get("/:id", getReminderById);

// ✏️ Update reminder
router.put("/:id", updateReminder);

// ❌ Delete reminder
router.delete("/:id", deleteReminder);

export default router;

