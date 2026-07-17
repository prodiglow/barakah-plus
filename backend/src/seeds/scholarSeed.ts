import mongoose from "mongoose";
import { ScholarEducation, IScholarEducation } from "../models/ScholarEducation";
import { ScholarSpecialization } from "../models/ScholarSpecialization";
import { Scholar } from "../models/Scholar";
import dotenv from "dotenv";
import { ScholarServices,IScholarServices } from "../models/scholarServices";
dotenv.config();


async function seed() {
  try {
    // Connect to your MongoDB Atlas database
   await mongoose.connect(process.env.MONGODB_URI!);
    console.log("✅ Connected to MongoDB Atlas: barakahDB");

    // (Optional) Clear reference collections before seeding
    await Promise.all([
      ScholarEducation.deleteMany({}),
      ScholarSpecialization.deleteMany({}),
    ]);
    console.log("🧹 Cleared Scholar reference collections");

    // Create base reference documents
  const edu: IScholarEducation[] = await ScholarEducation.create([
  { name: "Darse Nizami" },
  { name: "Jamia - e - Nizaamia" },
]);
  const ser: IScholarServices[] = await ScholarServices.create([
  { name: "Dua" },
  { name: "Isthekhara" },
  { name: "Wazaif and Adhkar" },
]);
    const spec = await ScholarSpecialization.create([{ name: "Artificial Intelligence" }]);
    console.log("📚 Reference data inserted successfully");

    const eduIds = edu.map(e => e._id);
    const specIds = spec.map(e => e._id);
    const serIds = ser.map(e => e._id);
    // Create a sample Scholar linked to those references
    const scholar = await Scholar.create({
      scholarID: 1002,
      scholarName: "Dr. Siddiqa Akhtar",
      scholarSpecialization: specIds,
      scholarExperience: 12,
      scholarEducation: eduIds, 
      rating: 4.8,
      ProfileImg: "https://res.cloudinary.com/debszasgn/image/upload/v1760523553/scholler2_xo8qs1.jpg",
       fee: 75, // 💵 new field
      blessings: 120, // 🙏 new field
      scholarServices: serIds,
    });

    console.log("🎓 Scholar created:", scholar.scholarName);

    // Safely check what collections exist (TypeScript-safe)
    const db = mongoose.connection.db;
    if (db) {
      const collections = await db.listCollections().toArray();
      console.log("📂 Collections now in barakahDB:", collections.map(c => c.name));
    }

    await mongoose.disconnect();
    console.log("✅ Done and disconnected");
  } catch (err) {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  }
}

seed();
