import mongoose, { Schema, Document, Types } from "mongoose";
import { Counter } from "./Counter";

export interface IScholar extends Document {
  scholarID: number;
  scholarName: string;
  scholarSpecialization: Types.ObjectId[];
  scholarExperience: number;
  scholarEducation: mongoose.Types.ObjectId[];
  rating: number;
  ProfileImg: string;
  reviews: mongoose.Types.ObjectId[];
  fee: number;        // 💵 in USD
  blessings: number;  // 🙏 numeric value
  scholarServices: mongoose.Types.ObjectId[];
  phone_number: string;
}

const ScholarSchema = new Schema<IScholar>(
  {
    scholarID: { type: Number, unique: true },
    scholarName: { type: String, required: true },
    scholarSpecialization: [
      {
        type: Schema.Types.ObjectId,
        ref: "ScholarSpecialization",
        required: true,
      },
    ],
    scholarExperience: { type: Number, required: true },
    scholarEducation: [
      {
        type: Schema.Types.ObjectId,
        ref: "ScholarEducation",
        required: true,
      },
    ],
    rating: { type: Number, required: true ,default:0},
    ProfileImg: { type: String, required: true },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "ScholarReview",
      },
    ],
    scholarServices: [
      {
        type: Schema.Types.ObjectId,
        ref: "ScholarServices",
        required: true,
      },
    ],

    // 💰 New fields
    fee: { type: Number, required: true, default: 0 },
    blessings: { type: Number, required: true, default: 0 },
    phone_number: { type: String, required: true },
  },
  { timestamps: true }
);

// 🧮 Auto-increment logic using shared Counter model
ScholarSchema.pre<IScholar>("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: "scholarID" },        // Unique counter name per collection
      { $inc: { seq: 1 } },      // Increment by 1 each time
      { new: true, upsert: true } // Create if not exist
    );
    this.scholarID = counter.seq; // Assign new incremented value
  }
  next();
});

export const Scholar = mongoose.model<IScholar>("Scholar", ScholarSchema);
