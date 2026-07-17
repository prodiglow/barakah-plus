import { Request, Response } from "express";
import User from "../models/User";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Generate JWT token
const generateToken = (id: string) => {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not defined");
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// ✅ PROFILE (Get logged-in user details)
export const getProfile = async (req: any, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(user);
  } catch (error) {
    console.error("❌ Profile fetch error:", error);
    res.status(500).json({ message: "Failed to fetch user profile" });
  }
};

export const updateUser= async (req:any, res:any) => {
  try {
    const { id } = req.params;
    const { name, email, phone, profilePic } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔒 Prevent IDOR: Ensure logged-in user matches the ID being updated
    if (req.user._id.toString() !== id) {
      return res.status(403).json({ message: "Not authorized to update this profile" });
    }

    // Check if new email/phone already exists for another user
    if (email || phone) {
      const conditions: any[] = [];
      if (email && email !== user.email) conditions.push({ email });
      if (phone && phone !== user.phone) conditions.push({ phone });

      if (conditions.length > 0) {
        const existingUser = await User.findOne({
          $and: [
            { $or: conditions },
            { _id: { $ne: id } }
          ]
        });

        if (existingUser) {
          return res.status(400).json({ 
            message: "Email or phone already in use by another user",
            fields: {
              email: email === existingUser.email,
              phone: phone === existingUser.phone
            }
          });
        }
      }
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.profilePic = profilePic || user.profilePic;

    await user.save();

    res.json({
      message: "User updated successfully ✅",
      user,
    });

  } catch (err) {
    console.error("User update error:", err);
    res.status(500).json({ message: "Failed to update user ❌" });
  }
}
