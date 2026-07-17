import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

// Define an interface for User documents
export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  password: string;
  profilePic?: string; // ✅ Add this line
  isVerified: boolean;
  matchPassword(enteredPassword: string): Promise<boolean>;
  _id: mongoose.Types.ObjectId;
}

// User schema
const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    profilePic: {
      type: String,
      default:
        "https://res.cloudinary.com/debszasgn/image/upload/v1760342360/user_zuyyum", // ✅ Default image
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Encrypt password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare passwords
userSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Export model
const User = mongoose.model<IUser>("User", userSchema);
export default User;
