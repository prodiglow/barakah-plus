import mongoose, { Schema, Document } from "mongoose";

export interface IReminder extends Document {
  OrderID: mongoose.Schema.Types.ObjectId; // Reference to Order
  reminderCount: number;
  IsSendReminder: number | boolean; // Can be 0, 1, true, or false
}

const ReminderSchema = new Schema<IReminder>(
  {
    OrderID: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    reminderCount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    IsSendReminder: {
      type: Schema.Types.Mixed, // Allows both number and boolean
      required: true,
      default: 0,
      validate: {
        validator: function (value: any) {
          // Accept 0, 1, true, or false
          return value === 0 || value === 1 || value === true || value === false;
        },
        message: "IsSendReminder must be 0, 1, true, or false",
      },
    },
  },
  { timestamps: true }
);

// Index for faster queries
ReminderSchema.index({ OrderID: 1 });

export const Reminder = mongoose.model<IReminder>("Reminder", ReminderSchema);

