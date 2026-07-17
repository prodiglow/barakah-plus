import { Request, Response } from "express";
import { Reminder } from "../models/Reminder";
import { Order } from "../models/Orders";
import mongoose from "mongoose";

/**
 * @desc Create a new reminder
 * @route POST /api/reminders
 */
export const createReminder = async (req: Request, res: Response) => {
  try {
    const { OrderID, reminderCount, IsSendReminder } = req.body;

    if (!OrderID) {
      return res.status(400).json({
        success: false,
        message: "OrderID is required",
      });
    }

    // Validate OrderID exists
    const order = await Order.findById(OrderID);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Validate IsSendReminder value
    if (
      IsSendReminder !== undefined &&
      IsSendReminder !== 0 &&
      IsSendReminder !== 1 &&
      IsSendReminder !== true &&
      IsSendReminder !== false
    ) {
      return res.status(400).json({
        success: false,
        message: "IsSendReminder must be 0, 1, true, or false",
      });
    }

    const reminder = await Reminder.create({
      OrderID,
      reminderCount: reminderCount || 0,
      IsSendReminder: IsSendReminder !== undefined ? IsSendReminder : 0,
    });

    res.status(201).json({
      success: true,
      message: "Reminder created successfully",
      data: reminder,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create reminder",
    });
  }
};

/**
 * @desc Get all reminders
 * @route GET /api/reminders
 */
export const getAllReminders = async (req: Request, res: Response) => {
  try {
    const reminders = await Reminder.find()
      .populate("OrderID")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: reminders,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch reminders",
    });
  }
};

/**
 * @desc Get reminder by ID
 * @route GET /api/reminders/:id
 */
export const getReminderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const reminder = await Reminder.findById(id).populate("OrderID");

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: "Reminder not found",
      });
    }

    res.status(200).json({
      success: true,
      data: reminder,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch reminder",
    });
  }
};

/**
 * @desc Get reminders by OrderID
 * @route GET /api/reminders/order/:orderID
 */
export const getRemindersByOrderId = async (req: Request, res: Response) => {
  try {
    const { orderID } = req.params;

    const objectId = new mongoose.Types.ObjectId(orderID);

    const reminders = await Reminder.find({ OrderID: objectId })
      .populate("OrderID")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: reminders,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch reminders",
    });
  }
};

/**
 * @desc Update reminder
 * @route PUT /api/reminders/:id
 */
export const updateReminder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reminderCount, IsSendReminder } = req.body;

    // Validate IsSendReminder if provided
    if (
      IsSendReminder !== undefined &&
      IsSendReminder !== 0 &&
      IsSendReminder !== 1 &&
      IsSendReminder !== true &&
      IsSendReminder !== false
    ) {
      return res.status(400).json({
        success: false,
        message: "IsSendReminder must be 0, 1, true, or false",
      });
    }

    const updateData: any = {};
    if (reminderCount !== undefined) updateData.reminderCount = reminderCount;
    if (IsSendReminder !== undefined) updateData.IsSendReminder = IsSendReminder;

    const reminder = await Reminder.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("OrderID");

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: "Reminder not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Reminder updated successfully",
      data: reminder,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update reminder",
    });
  }
};

/**
 * @desc Increment reminder count
 * @route PATCH /api/reminders/:id/increment
 */
export const incrementReminderCount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const reminder = await Reminder.findByIdAndUpdate(
      id,
      { $inc: { reminderCount: 1 } },
      { new: true, runValidators: true }
    ).populate("OrderID");

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: "Reminder not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Reminder count incremented",
      data: reminder,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to increment reminder count",
    });
  }
};

/**
 * @desc Delete reminder
 * @route DELETE /api/reminders/:id
 */
export const deleteReminder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const reminder = await Reminder.findByIdAndDelete(id);

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: "Reminder not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Reminder deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete reminder",
    });
  }
};

