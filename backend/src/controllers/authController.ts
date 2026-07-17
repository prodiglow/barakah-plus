import { Request, Response } from "express";
import User from "../models/User";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { sendEmail } from "../services/emailService";

dotenv.config();

// Generate JWT token (default 30d)
const generateToken = (id: string, expiresIn: string | number = "30d") => {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not defined");
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: expiresIn as any,
  });
};

// ✅ SIGNUP (Register new user)
export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, password, profilePic } = req.body;

    // Validation
    if (!name || !email || !phone || !password) {
      res.status(400).json({ message: "All fields (name, email, phone, password) are required" });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({email});
    if (existingUser) {
      if (existingUser.email === email) {
        res.status(400).json({ message: "User already exists with this email" });
      } 
      return;
    }

    // Create new user
    const user = await User.create({ name, email, phone, password, profilePic });

    // Send Welcome Email
    try {
      const subject = "Welcome to Barakah!";
      const text = `Hello ${user.name},\n\nWelcome to Barakah! We are excited to have you on board.\n\nBest Regards,\nTeam Barakah`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #333; text-align: center;">Welcome to Barakah!</h2>
          <p style="font-size: 16px; color: #555;">Hello <b>${user.name}</b>,</p>
          <p style="font-size: 16px; color: #555;">We are excited to have you on board.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://barakaplus.com/" style="background-color: #04AA6D; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">Go to Dashboard</a>
          </div>
          <p style="font-size: 14px; color: #999;">Best Regards,<br>Team Barakah</p>
        </div>
      `;
      await sendEmail(user.email, subject, text, html);
    } catch (emailError) {
      console.error("❌ Error sending welcome email:", emailError);
      // Continue without failing signup
    }

    // Response
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      token: generateToken((user._id as unknown as string).toString()),
    });
  } catch (error: any) {
    console.error("❌ Signup error:", error);
    res.status(500).json({ 
      message: "Server error during signup", 
      error: error?.message || "Unknown error",
      stack: error?.stack 
    });
  }
};

// ✅ LOGIN (Authenticate user)
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        token: generateToken(user._id.toString()),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// ✅ Check if user exists (for multi-step signup validation)
export const checkUserExists = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, phone, userId } = req.body;

    if (!email && !phone) {

      res.status(400).json({ message: "Email or phone is required" });
      return;
    }

    const users = await User.find({ 
      $and: [
        { email },
        userId ? { _id: { $ne: userId } } : {}
      ]
    });
    
    if (users.length > 0) {
      res.status(400).json({
        message: "User already exists",
        fields: {
          email: true,
          phone: false
        }
      });
      return;
    }

    res.status(200).json({ message: "User does not exist" });
  } catch (error) {
    console.error("❌ Check User error:", error);
    res.status(500).json({ message: "Server error during user check" });
  }
};

// ✅ FORGOT PASSWORD
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, phone } = req.body;

    if (!email && !phone) {
      res.status(400).json({ message: "Email or Phone is required" });
      return;
    }

    const user = await User.findOne(email ? { email } : { phone });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Generate reset token (expires in 5 minutes)
    const resetToken = generateToken((user._id as unknown as string).toString(), "5m");

    // Construct Reset Link
    // Construct Reset Link
    const baseUrl = "https://barakah-project-fe.vercel.app/";
    const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

    if (email) {
      // Send Email
      const subject = "Password Reset Request";
      const text = `You requested a password reset. Please use the following link to reset your password: ${resetLink} \n\nThis link expires in 5 minutes.`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
          <p style="font-size: 16px; color: #555;">Hello,</p>
          <p style="font-size: 16px; color: #555;">You requested a password reset. Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #04AA6D; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">Reset Password</a>
          </div>
          <p style="font-size: 14px; color: #777;">This link will expire in 5 minutes.</p>
          <p style="font-size: 14px; color: #999; margin-top: 20px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `;

      // Assuming sendEmail is imported from '../services/emailService'
      // We need to import it at the top if not already there, but seeing the file content it wasn't there.
      // I will add the import in a separate chunk or rely on the user to fix if missing (better to add it).
      // Since I can't add import easily with this tool if I don't target valid range, I will add logic here 
      // and assume I can add import in another step or this file already has it?
      // Wait, I saw authController.ts content, it DOES NOT import sendEmail. 
      // I will add the import in a separate ReplaceFile call or here if possible. 
      // I will proceed with logic and fix imports after.
      
      /* dynamic import or assuming global? No, need import. */
      
      const { sendEmail } = await import("../services/emailService");
      await sendEmail(email, subject, text, html);

      res.status(200).json({ message: "Password reset link sent to email" });
    } else {
      // Phone / WhatsApp Logic (Mock)
      // Since we don't have SMS/WA integration, we return the link to the frontend
      res.status(200).json({ 
        message: "Password reset link generated (Mock)", 
        link: resetLink 
      });
    }

  } catch (error) {
    console.error("❌ Forgot Password error:", error);
    res.status(500).json({ message: "Server error during forgot password" });
  }
};

// ✅ RESET PASSWORD
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({ message: "Token and new password are required" });
      return;
    }

    // Verify Token
    let decoded: any;
    try {
      if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not defined");
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      res.status(400).json({ message: "Invalid or expired token" });
      return;
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Update Password
    // The pre-save hook in User model handles hashing!
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });

  } catch (error) {
    console.error("❌ Reset Password error:", error);
    res.status(500).json({ message: "Server error during reset password" });
  }
};


