import { Request, Response } from "express";
import { Scholar } from "../models/Scholar";
import { ScholarEducation } from "../models/ScholarEducation"; // 👈 add this
import { ScholarSpecialization } from "../models/ScholarSpecialization"; // 👈 add this
import { ScholarReview } from "../models/ScholarReview"; // 👈 add this
import { ScholarServices } from "../models/scholarServices"; // 👈 add this


// Get all scholars
export const getAllScholars = async (req:Request, res:Response) => {
  try {
    const scholars = await Scholar.find()
      .populate("scholarEducation")
      .populate("scholarSpecialization")
      .populate("scholarServices")
      .populate({
        path: "reviews",
        match: { status: "approved" },
        populate: {
          path: "reviewer", 
          select: "name email profilePic", 
        },
      })
       .sort({ createdAt: -1 });

    res.json(scholars);
  } catch (error) {
    console.error("Error fetching scholars:", error);
    res.status(500).json({ error: "Failed to fetch scholars" });
  }
};


// Get scholar by ID
export const getScholarById = async (req: Request, res: Response) => {
  try {
    const scholar = await Scholar.findOne({
      scholarID: parseInt(String(req.params.scholarID)),
    })
      .populate("scholarEducation")
      .populate("scholarSpecialization")
      .populate("scholarServices")
      .populate({
        path: "reviews",
        match: { status: "approved" },
        populate: {
          path: "reviewer", 
          select: "name email profilePic", 
        },
      });

    if (!scholar)
      return res.status(404).json({ error: "Scholar not found" });

    res.json(scholar);
  } catch (error) {
    console.error("Error fetching scholar:", error);
    res.status(500).json({ error: "Failed to fetch scholar" });
  }
};

// Create scholar
export const createScholar = async (req: Request, res: Response) => {
  try {
    const {
      scholarName,
      scholarExperience,
      scholarEducation,
      scholarSpecialization,
      rating,
      ProfileImg,
      fee,           // 💵 added
      blessings,  
      scholarServices,   // 🙏 added
      phone_number,
    } = req.body;

    // Ensure we have arrays
    const educations = Array.isArray(scholarEducation)
      ? scholarEducation
      : [scholarEducation];
    const specializations = Array.isArray(scholarSpecialization)
      ? scholarSpecialization
      : [scholarSpecialization];
      
      const services = Array.isArray(scholarServices)
      ? scholarServices
      : [scholarServices];

    // Create or find ScholarEducation docs
    const educationIds = await Promise.all(
      educations.map(async (edu: any) => {
        if (!edu) return null;
        const name = typeof edu === "string" ? edu : edu.name;
        let existing = await ScholarEducation.findOne({ name });
        if (!existing) existing = await ScholarEducation.create({ name });
        return existing._id;
      })
    );

     const servicesIds = await Promise.all(
      services.map(async (edu: any) => {
        if (!edu) return null;
        const name = typeof edu === "string" ? edu : edu.name;
        let existing = await ScholarServices.findOne({ name });
        if (!existing) existing = await ScholarServices.create({ name });
        return existing._id;
      })
    );

    // Create or find ScholarSpecialization docs
    const specializationIds = await Promise.all(
      specializations.map(async (spec: any) => {
        if (!spec) return null;
        const name = typeof spec === "string" ? spec : spec.name;
        let existing = await ScholarSpecialization.findOne({ name });
        if (!existing) existing = await ScholarSpecialization.create({ name });
        return existing._id;
      })
    );

    // ✅ Create Scholar document with fee & blessings (scholarID auto-incremented)
    const newScholar = await Scholar.create({
      scholarName,
      scholarExperience,
      scholarEducation: educationIds,
      scholarSpecialization: specializationIds,
      rating,
      ProfileImg,
      fee: fee || 0,             // default if missing
      blessings: blessings || 0, // default if missing
      scholarServices: servicesIds,
      phone_number,
    });

    res.status(201).json({
      message: "Scholar created successfully",
      data: newScholar,
    });
  } catch (error) {
    console.error("Error creating scholar:", error);
    res.status(500).json({ error: "Failed to create scholar" });
  }
};

// Update scholar
// Update scholar by _id
export const updateScholar = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // ❗ MUST match route: /scholars/:id

    const {
      scholarName,
      scholarExperience,
      scholarEducation,
      scholarSpecialization,
      rating,
      ProfileImg,
      fee,
      blessings,
      scholarServices,
      phone_number,
    } = req.body;

    // 🔍 Find existing scholar
    const existing = await Scholar.findById(id);
    if (!existing) {
      return res.status(404).json({ error: "Scholar not found" });
    }

    // ✔ Update object
    const updateData: any = {};

    if (scholarName !== undefined) updateData.scholarName = scholarName;
    if (scholarExperience !== undefined) updateData.scholarExperience = scholarExperience;
    if (rating !== undefined) updateData.rating = rating;
    if (ProfileImg !== undefined) updateData.ProfileImg = ProfileImg;
    if (fee !== undefined) updateData.fee = fee;
    if (blessings !== undefined) updateData.blessings = blessings;
    if (phone_number !== undefined) updateData.phone_number = phone_number;

    // ---------------------------
    //   EDUCATION ARRAY UPDATE
    // ---------------------------
    if (scholarEducation !== undefined) {
      const educations = Array.isArray(scholarEducation)
        ? scholarEducation
        : [scholarEducation];

      const educationIds = await Promise.all(
        educations.map(async (edu) => {
          if (!edu) return null;
          const name = typeof edu === "string" ? edu : edu.name;
          let ex = await ScholarEducation.findOne({ name });
          if (!ex) ex = await ScholarEducation.create({ name });
          return ex._id;
        })
      );

      updateData.scholarEducation = educationIds.filter((id) => id !== null);
    }

    // ---------------------------
    //   SPECIALIZATION ARRAY UPDATE
    // ---------------------------
    if (scholarSpecialization !== undefined) {
      const specs = Array.isArray(scholarSpecialization)
        ? scholarSpecialization
        : [scholarSpecialization];

      const specializationIds = await Promise.all(
        specs.map(async (spec) => {
          if (!spec) return null;
          const name = typeof spec === "string" ? spec : spec.name;
          let ex = await ScholarSpecialization.findOne({ name });
          if (!ex) ex = await ScholarSpecialization.create({ name });
          return ex._id;
        })
      );

      updateData.scholarSpecialization = specializationIds.filter(
        (id) => id !== null
      );
    }

    // ---------------------------
    //   SERVICES ARRAY UPDATE
    // ---------------------------
    if (scholarServices !== undefined) {
      const services = Array.isArray(scholarServices)
        ? scholarServices
        : [scholarServices];

      const servicesIds = await Promise.all(
        services.map(async (service) => {
          if (!service) return null;
          const name = typeof service === "string" ? service : service.name;
          let ex = await ScholarServices.findOne({ name });
          if (!ex) ex = await ScholarServices.create({ name });
          return ex._id;
        })
      );

      updateData.scholarServices = servicesIds.filter((id) => id !== null);
    }

    // ---------------------------
    //   UPDATE THE SCHOLAR
    // ---------------------------
    const updatedScholar = await Scholar.findByIdAndUpdate(id, updateData, {
      new: true,
    })
      .populate("scholarEducation")
      .populate("scholarSpecialization")
      .populate("scholarServices")
      .populate({
        path: "reviews",
        match: { status: "approved" },
        populate: {
          path: "reviewer",
          select: "name email profilePic",
        },
      });

    res.json({
      message: "Scholar updated successfully",
      data: updatedScholar,
    });
  } catch (error) {
    console.error("Error updating scholar:", error);
    res.status(500).json({ error: "Failed to update scholar" });
  }
};


// Delete scholar by _id (ObjectId)
export const deleteScholar = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; 

    const deletedScholar = await Scholar.findByIdAndDelete(id);

    if (!deletedScholar) {
      return res.status(404).json({ error: "Scholar not found" });
    }

    res.json({
      message: "Scholar deleted successfully",
      data: deletedScholar,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete scholar" });
  }
};



