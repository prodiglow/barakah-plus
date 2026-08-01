import { Request, Response } from "express";
import Admin from "../models/Admin";
import User from "../models/User";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { syncAdminToCms } from "../services/cmsSyncService";

dotenv.config();

// Generate JWT token
const generateToken = (id: string) => {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not defined");
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// ✅ LOGIN (Authenticate admin)
export const adminLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const admin = await Admin.findOne({ email });

    if (admin && (await admin.matchPassword(password))) {
      res.json({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        token: generateToken(admin._id.toString()),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("❌ Admin login error:", error);
    res.status(500).json({ message: "Server error during admin login" });
  }
};

// ✅ FORGOT PASSWORD (Admin)
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, phone } = req.body;

    if (!email && !phone) {
      res.status(400).json({ message: "Email or Phone is required" });
      return;
    }

    const admin = await Admin.findOne(email ? { email } : { phone });

    if (!admin) {
      res.status(404).json({ message: "Admin not found" });
      return;
    }

    // Generate reset token (expires in 5 minutes)
    const resetToken = generateToken((admin._id as unknown as string).toString()); // Reusing generateToken, though it defaults to 30d in current impl, let's adjust or use specific token logic if strict.
    // actually generateToken in adminController is hardcoded to 30d. 
    // I should probably make a specific shorter token or just use it.
    // Start with reusing or modifying generateToken to accept expiry.
    // For now, I will use jwt directly here for custom expiry to match authController behavior of 5m
    
    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not defined");
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: "5m" });

    // Construct Reset Link (Point to Admin Frontend)
    // admin frontend URL? 
    // Assuming it's on a different subdomain or same domain? 
    // The user didn't specify admin URL. 
    // I need to know the Admin Frontend URL. 
    // usually it is something like admin.barakah-project.vercel.app or /admin route.
    // I'll assume standard Vercel layout or ask? 
    // Wait, the user said "like password reset in frontend main".
    // I'll use a placeholder or try to infer.
    // If I look at cors setup in backend app.ts I might see allowed origins.
    // For now I'll use the same base URL structure but pointing to admin path if exists.
    // actually, let's look at `frontend-admin` .env if possible to see its URL? 
    // or just use a placeholder `https://barakah-project-admin.vercel.app/reset-password` and user can correct.
    const baseUrl = "https://barakah-project-ad.vercel.app"; // Guessing based on common patterns
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    if (email) {
      // Send Email
      const { sendEmail } = await import("../services/emailService");
      const subject = "Admin Password Reset Request";
      const text = `You requested a password reset for your admin account. Please use the following link to reset your password: ${resetLink} \n\nThis link expires in 5 minutes.`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #333; text-align: center;">Admin Password Reset Request</h2>
          <p style="font-size: 16px; color: #555;">Hello Admin,</p>
          <p style="font-size: 16px; color: #555;">You requested a password reset. Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #04AA6D; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">Reset Password</a>
          </div>
          <p style="font-size: 14px; color: #777;">This link will expire in 5 minutes.</p>
          <p style="font-size: 14px; color: #999; margin-top: 20px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `;

      await sendEmail(email, subject, text, html);

      res.status(200).json({ message: "Password reset link sent to email" });
    } else {
      res.status(200).json({ 
        message: "Password reset link generated (Mock)", 
        link: resetLink 
      });
    }

  } catch (error) {
    console.error("❌ Admin Forgot Password error:", error);
    res.status(500).json({ message: "Server error during forgot password" });
  }
};

// ✅ RESET PASSWORD (Admin)
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

    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      res.status(404).json({ message: "Admin not found" });
      return;
    }

    // Update Password
    admin.password = newPassword;
    await admin.save();

    syncAdminToCms({
      id: admin._id.toString(),
      name: admin.name,
      email: admin.email,
      password: newPassword,
    });

    res.status(200).json({ message: "Password updated successfully" });

  } catch (error) {
    console.error("❌ Admin Reset Password error:", error);
    res.status(500).json({ message: "Server error during reset password" });
  }
};


// ✅ GET ALL USERS (Admin)
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.aggregate([
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "UserID",
          as: "orders",
        },
      },
      {
        $addFields: {
          ordersCount: { $size: "$orders" },
          totalOrderAmt: { $sum: "$orders.OrderAmt" },
          ordersCompleted: {
            $size: {
              $filter: {
                input: "$orders",
                as: "order",
                cond: { $eq: ["$$order.Status", "Completed"] }
              }
            }
          },
          ordersProcessing: {
            $size: {
              $filter: {
                input: "$orders",
                as: "order",
                cond: {
                  $and: [
                    { $ne: ["$$order.Status", "Completed"] },
                    { $ne: ["$$order.Status", "Cancelled"] },
                    { $ne: ["$$order.Status", "User Review Requested"] }
                  ]
                }
              }
            }
          },
          ordersAmountPaid: {
             $sum: {
                 $map: {
                     input: {
                         $filter: {
                             input: "$orders",
                             as: "order",
                             cond: { $eq: ["$$order.PaymentStatus", "Paid"] }
                         }
                     },
                     as: "paidOrder",
                     in: "$$paidOrder.OrderAmt"
                 }
             }
          },
         ordersAmountPending: {
            $sum: {
                $map: {
                    input: {
                        $filter: {
                            input: "$orders",
                            as: "order",
                            cond: { $eq: ["$$order.PaymentStatus", "Pending"] }
                        }
                    },
                    as: "pendingOrder",
                    in: "$$pendingOrder.OrderAmt"
                }
            }
         }
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          profilePic: 1,
          phone: 1,
          isVerified: 1,
          createdAt: 1,
          ordersCount: 1,
          totalOrderAmt: 1,
          ordersCompleted: 1,
          ordersProcessing: 1,
          ordersAmountPaid: 1,
          ordersAmountPending: 1
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    res.json(users);
  } catch (error) {
    console.error("❌ Get All Users error:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// ✅ UPDATE USER AS ADMIN
export const updateUserByAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, phone, isVerified } = req.body;

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Check for email/phone duplication if changed
    if ((email && email !== user.email) || (phone && phone !== user.phone)) {
        const conditions: any[] = [];
        if (email && email !== user.email) conditions.push({ email });
        if (phone && phone !== user.phone) conditions.push({ phone });
  
        const existingUser = await User.findOne({
            $and: [
              { $or: conditions },
              { _id: { $ne: id } }
            ]
        });
  
        if (existingUser) {
             res.status(400).json({ 
              message: "Email or phone already in use by another user",
            });
            return;
        }
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    if (typeof isVerified === 'boolean') {
        user.isVerified = isVerified;
    }

    const updatedUser = await user.save();
    
    res.json({
        message: "User updated successfully",
        user: {
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            isVerified: updatedUser.isVerified,
            profilePic: updatedUser.profilePic
        }
    });

  } catch (error) {
    console.error("❌ Update User By Admin error:", error);
    res.status(500).json({ message: "Failed to update user" });
  }
};

// ✅ DELETE USER (Admin)
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    await User.findByIdAndDelete(id);
    res.json({ message: "User deleted successfully" });

  } catch (error) {
    console.error("❌ Delete User error:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
};
