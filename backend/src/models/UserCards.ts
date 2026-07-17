import mongoose, { Schema, Document } from "mongoose";

export interface IUserCard extends Document {
  userID: mongoose.Types.ObjectId; // Reference to the user
  cardNumber: string;              // e.g. "4242424242424242"
  expiryDate: string;              // e.g. "12/27"
  cvc: string;                     // e.g. "123"
  nameOnCard: string;              // e.g. "Muhammad Zargham"
  createdAt?: Date;
  updatedAt?: Date;
}

const UserCardsSchema = new Schema<IUserCard>(
  {
    userID: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cardNumber: {
      type: String,
      required: true,
      trim: true,
    },
    expiryDate: {
      type: String,
      required: true,
      trim: true,
    },
    cvc: {
      type: String,
      required: true,
      trim: true,
    },
    nameOnCard: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IUserCard>("UserCards", UserCardsSchema);
