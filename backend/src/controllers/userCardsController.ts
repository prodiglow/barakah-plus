import { Request, Response } from "express";
import UserCards from "../models/UserCards";
import { encrypt, decrypt } from "../utils/encryption";
import mongoose from "mongoose";

/**
 * @desc Add a new user card
 * @route POST /api/user-cards
 */
export const addUserCard = async (req: Request, res: Response) => {
  try {
    const { userID, cardNumber, expiryDate, cvc, nameOnCard } = req.body;

    if (!userID || !cardNumber || !expiryDate || !cvc || !nameOnCard) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // 🔐 Encrypt before saving
    const newCard = await UserCards.create({
      userID,
      cardNumber: encrypt(cardNumber),
      expiryDate: encrypt(expiryDate),
      cvc: encrypt(cvc),
      nameOnCard: encrypt(nameOnCard),
    });

    res.status(201).json({
      success: true,
      message: "Card added successfully",
      data: newCard,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to add card",
    });
  }
};

/**
 * @desc Get all cards for a user
 * @route GET /api/user-cards/:userID
 */
export const getUserCards = async (req: Request, res: Response) => {
  try {
    const { userID } = req.params;

    // ✅ Convert string to ObjectId before querying
    const objectId = new mongoose.Types.ObjectId(userID);

    const cards = await UserCards.find({ userID: objectId }).sort({ createdAt: -1 });

    if (!cards.length) {
      return res.status(200).json({
        success: true,
        message: "No cards found for this user",
        data: [],
      });
    }

    // 🔓 Decrypt before sending
    const decryptedCards = cards.map((card: any) => ({
      ...card.toObject(),
      cardNumber: decrypt(card.cardNumber).replace(/\d(?=\d{4})/g, "*"),
      expiryDate: decrypt(card.expiryDate),
      cvc: decrypt(card.cvc),
      nameOnCard: decrypt(card.nameOnCard),
    }));

    res.status(200).json({
      success: true,
      data: decryptedCards,
    });
  } catch (error: any) {
    console.error("❌ Error fetching user cards:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch user cards",
    });
  }
};

/**
 * @desc Delete a user card
 * @route DELETE /api/user-cards/:id
 */
export const deleteUserCard = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deleted = await UserCards.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Card not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Card deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete card",
    });
  }
};
