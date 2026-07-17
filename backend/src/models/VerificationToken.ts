import mongoose, { Document, Schema } from 'mongoose';

export interface IVerificationToken extends Document {
  userId?: mongoose.Types.ObjectId;
  email?: string;
  phone?: string;
  token: string;
  createdAt: Date;
}

const verificationTokenSchema = new Schema<IVerificationToken>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Optional for pre-signup
  },
  email: {
    type: String,
    required: false, // Optional if userId is present
  },
  phone: {
    type: String,
    required: false,
  },
  token: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
    expires:600, // Token expires in 1 hour
  },
});

const VerificationToken = mongoose.model<IVerificationToken>('VerificationToken', verificationTokenSchema);

export default VerificationToken;
