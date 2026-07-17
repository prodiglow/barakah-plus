import mongoose, { Schema, Document, Types } from "mongoose";
import { Counter } from "./Counter"; // Reuse shared counter

export interface IEvent extends Document {
  eventID: number;
  eventTitle: string;
  eventSpecial: string;
  description: string;
  eventLocation: string;
  eventDate: Date;
  eventPic: string;
  joiningLink: string;
  isFeatured: boolean;
  showOnHomePage: boolean;
  quranKhawaniDate?: string;
  quranKhawaniTimeSlot?: string;
  participants: Types.ObjectId[];
  orderId?: Types.ObjectId;
}

// Define schema
const EventSchema = new Schema<IEvent>(
  {
    eventID: { type: Number, unique: true }, // auto-generated
    eventTitle: { type: String, required: true },
    eventSpecial: { type: String, required: true },
    description: { type: String, required: true },
    eventLocation: { type: String, required: true },
    eventDate: { type: Date, required: true },
    eventPic: { type: String, required: true },
    joiningLink: { type: String, required: true },
    isFeatured: { type: Boolean, default: false },
    showOnHomePage: { type: Boolean, default: false },
    quranKhawaniDate: { type: String },
    quranKhawaniTimeSlot: { type: String },
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

// 🧮 Auto-increment logic using shared Counter model
EventSchema.pre<IEvent>("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: "eventID" },        // Unique counter name per collection
      { $inc: { seq: 1 } },      // Increment by 1 each time
      { new: true, upsert: true } // Create if not exist
    );
    this.eventID = counter.seq; // Assign new incremented value
  }
  next();
});

export const Event = mongoose.model<IEvent>("Event", EventSchema);
