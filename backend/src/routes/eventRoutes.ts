import express from "express";
import {
  insertEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from "../controllers/eventController";

const router = express.Router();

// CRUD Routes
router.post("/insert", insertEvent);
router.get("/", getAllEvents);
router.get("/:id", getEventById);
router.put("/update/:id", updateEvent);
router.delete("/delete/:id", deleteEvent);

export default router;
