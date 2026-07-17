import { Request, Response } from "express";
import Dua from "../models/Dua";

// @desc    Create a new Dua
// @route   POST /api/duas
// @access  Private/Admin
export const createDua = async (req: Request, res: Response) => {
  try {
    const { title, arabic_text, transliteration, translation, reference, virtue, explanation, audioUrl, category, language, repeat, is_active } = req.body;

    const newDua = new Dua({
      title,
      arabic_text,
      transliteration,
      translation,
      reference,
      virtue,
      explanation,
      audioUrl,
      category,
      language,
      repeat,
      is_active,
    });

    const savedDua = await newDua.save();
    res.status(201).json(savedDua);
  } catch (error) {
    res.status(500).json({ message: "Error creating Dua", error });
  }
};

// @desc    Get all Duas
// @route   GET /api/duas
// @access  Public (or Private based on needs, kept distinct for Admin usually but standard GET for now)
export const getAllDuas = async (req: Request, res: Response) => {
  try {
    // Optional query param ?active=true to get only active ones
    const { active, category } = req.query;
    const filter: any = {};
    
    if (active === "true") {
      filter.is_active = true;
    }

    if (category) {
      filter.category = category;
    }
    
    // Sort by createdAt descending, and populate category details
    const duas = await Dua.find(filter)
      .populate("category")
      .sort({ createdAt: -1 });
      
    res.status(200).json(duas);
  } catch (error) {
    res.status(500).json({ message: "Error fetching Duas", error });
  }
};

// @desc    Get single Dua
// @route   GET /api/duas/:id
// @access  Public
export const getDuaById = async (req: Request, res: Response) => {
  try {
    const dua = await Dua.findById(req.params.id).populate("category");
    if (!dua) {
      return res.status(404).json({ message: "Dua not found" });
    }
    res.status(200).json(dua);
  } catch (error) {
    res.status(500).json({ message: "Error fetching Dua", error });
  }
};

// @desc    Update a Dua
// @route   PUT /api/duas/:id
// @access  Private/Admin
export const updateDua = async (req: Request, res: Response) => {
  try {
    const updatedDua = await Dua.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedDua) {
      return res.status(404).json({ message: "Dua not found" });
    }
    res.status(200).json(updatedDua);
  } catch (error) {
    res.status(500).json({ message: "Error updating Dua", error });
  }
};

// @desc    Delete a Dua
// @route   DELETE /api/duas/:id
// @access  Private/Admin
export const deleteDua = async (req: Request, res: Response) => {
  try {
    const deletedDua = await Dua.findByIdAndDelete(req.params.id);
    if (!deletedDua) {
      return res.status(404).json({ message: "Dua not found" });
    }
    res.status(200).json({ message: "Dua deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting Dua", error });
  }
};

// @desc    Toggle Dua Active Status
// @route   PATCH /api/duas/:id/toggle-status
// @access  Private/Admin
export const toggleDuaStatus = async (req: Request, res: Response) => {
  try {
    const dua = await Dua.findById(req.params.id);
    if (!dua) {
      return res.status(404).json({ message: "Dua not found" });
    }
    dua.is_active = !dua.is_active;
    await dua.save();
    res.status(200).json(dua);
  } catch (error) {
    res.status(500).json({ message: "Error toggling status", error });
  }
};
