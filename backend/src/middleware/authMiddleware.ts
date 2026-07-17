import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import dotenv from "dotenv";

dotenv.config();

export const protect = async (req: any, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not defined");
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: string };
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      res.status(401).json({ message: "Not authorized, token invalid" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

export const protectAny = async (req: any, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not defined");
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: string };

      // Try finding User first
      const user = await User.findById(decoded.id).select("-password");
      if (user) {
        req.user = user;
        req.userType = 'user';
        return next();
      }

      // If not User, try Admin
      const { default: Admin } = await import("../models/Admin"); // Dynamic import to avoid circular dependency if any
      const admin = await Admin.findById(decoded.id).select("-password");
      if (admin) {
        req.admin = admin;
        req.userType = 'admin';
        return next();
      }

      res.status(401).json({ message: "Not authorized, user not found" });
    } catch (error) {
      console.error("Auth Error:", error);
      res.status(401).json({ message: "Not authorized, token invalid" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};
