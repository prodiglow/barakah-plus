import mongoose, { Schema, Document, Types } from "mongoose";

export interface IEventParticipant extends Document {
  event: Types.ObjectId;
  user: Types.ObjectId;
  role: string; // e.g., "attendee", "speaker", "organizer"
  joinedAt: Date;
}

const EventParticipantSchema = new Schema<IEventParticipant>(
  {
    event: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, default: "attendee" },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const EventParticipant = mongoose.model<IEventParticipant>(
  "EventParticipant",
  EventParticipantSchema
);
