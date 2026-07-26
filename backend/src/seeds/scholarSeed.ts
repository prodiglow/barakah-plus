/* ============================================================================
 * ⚠️ TEST / PLACEHOLDER DATA WARNING ⚠️
 * ============================================================================
 * This script additively seeds reference data (ScholarEducation,
 * ScholarSpecialization, ScholarServices) and scholars. It NEVER deletes
 * existing documents — every write below is a find-or-create-by-name, safe
 * to run repeatedly and safe to run against a database that already has
 * real data in it.
 *
 * In addition to the original single seeded scholar, this script creates
 * EIGHT placeholder scholars — one for every combination of gender
 * (male/female) x sect (Shia/Deobandi/Barelvi/Ahl-e-Hadith) from
 * `../constants/scholarMatching`. These eight scholars are TEST /
 * PLACEHOLDER data ONLY, named "Test Scholar (...)" so they are easy to
 * find and remove. They exist solely so the Free Personal Dua
 * gender x sect auto-assignment always has a real match to fall back on
 * until real scholars are recruited across all combinations.
 *
 * These eight placeholder scholars are meant to be REMOVED or REPLACED with
 * real, vetted scholars once recruiting for each gender/sect combination is
 * complete. Do NOT treat them as real, bookable scholars.
 *
 * This script MUST NOT be run against production without the above being
 * understood and explicitly confirmed — even though it is additive/
 * idempotent, running it against the live database will create these eight
 * test scholars there, where they could be matched to real user orders.
 * ============================================================================
 */

import mongoose, { Model, Document } from "mongoose";
import { ScholarEducation, IScholarEducation } from "../models/ScholarEducation";
import { ScholarSpecialization, IScholarSpecialization } from "../models/ScholarSpecialization";
import { Scholar } from "../models/Scholar";
import dotenv from "dotenv";
import { ScholarServices, IScholarServices } from "../models/scholarServices";
import { SECTS, GENDERS } from "../constants/scholarMatching";
dotenv.config();

// Same Cloudinary placeholder image already used by the existing seeded scholar.
const PROFILE_IMG =
  "https://res.cloudinary.com/debszasgn/image/upload/v1760523553/scholler2_xo8qs1.jpg";

// 🔎 Find-or-create a { name } reference document (ScholarEducation,
// ScholarSpecialization, ScholarServices all share this shape). Never
// deletes or overwrites an existing document with the same name.
async function findOrCreateByName<T extends Document & { name: string }>(
  model: Model<T>,
  name: string
): Promise<T> {
  const existing = await model.findOne({ name });
  if (existing) {
    console.log(`ℹ️ ${model.modelName} already exists, skipping: "${name}"`);
    return existing;
  }
  const created = await model.create({ name } as any);
  console.log(`✅ Created ${model.modelName}: "${name}"`);
  return created;
}

async function seed() {
  try {
    // Connect to your MongoDB Atlas database
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("✅ Connected to MongoDB Atlas: barakahDB");

    // 📚 Find-or-create reference documents (additive, idempotent — no deletes)
    const eduNames = ["Darse Nizami", "Jamia - e - Nizaamia"];
    const edu: IScholarEducation[] = [];
    for (const name of eduNames) {
      edu.push(await findOrCreateByName(ScholarEducation, name));
    }

    const serviceNames = ["Dua", "Isthekhara", "Wazaif and Adhkar"];
    const ser: IScholarServices[] = [];
    for (const name of serviceNames) {
      ser.push(await findOrCreateByName(ScholarServices, name));
    }

    const specNames = ["Artificial Intelligence"];
    const spec: IScholarSpecialization[] = [];
    for (const name of specNames) {
      spec.push(await findOrCreateByName(ScholarSpecialization, name));
    }

    console.log("📚 Reference data ensured (find-or-create, no deletes)");

    const eduIds = edu.map((e) => e._id);
    const specIds = spec.map((e) => e._id);
    const serIds = ser.map((e) => e._id);

    // 🎓 Original single seeded scholar — only created if it doesn't already
    // exist (by scholarName). The live production document under this name
    // is left untouched by this idempotent guard.
    const EXISTING_SCHOLAR_NAME = "Dr. Siddiqa Akhtar";
    let scholar = await Scholar.findOne({ scholarName: EXISTING_SCHOLAR_NAME });
    if (!scholar) {
      scholar = await Scholar.create({
        scholarID: 1002,
        scholarName: EXISTING_SCHOLAR_NAME,
        phone_number: "+923001234567",
        scholarSpecialization: specIds,
        scholarExperience: 12,
        scholarEducation: eduIds,
        rating: 4.8,
        ProfileImg: PROFILE_IMG,
        fee: 75, // 💵 new field
        blessings: 120, // 🙏 new field
        scholarServices: serIds,
        // gender/sect are new required schema fields; this creation path only
        // runs when a fresh/empty database has no document with this name yet
        // (e.g. local dev), so these are best-guess defaults, not a change to
        // the real production document.
        gender: "female",
        sect: "Deobandi",
      });
      console.log("🎓 Scholar created:", scholar.scholarName);
    } else {
      console.log("ℹ️ Scholar already exists, skipping:", scholar.scholarName);
    }

    // 🧪 TEST / PLACEHOLDER scholars — one per gender x sect combination.
    // See the warning block at the top of this file. Each is idempotent by
    // scholarName.
    for (const gender of GENDERS) {
      for (const sect of SECTS) {
        const genderLabel = gender === "male" ? "Male" : "Female";
        const placeholderName = `Test Scholar (${genderLabel} / ${sect})`;

        const existingPlaceholder = await Scholar.findOne({ scholarName: placeholderName });
        if (existingPlaceholder) {
          console.log(`ℹ️ Placeholder scholar already exists, skipping: "${placeholderName}"`);
          continue;
        }

        const placeholder = await Scholar.create({
          scholarName: placeholderName,
          phone_number: "+10000000000", // placeholder — not a real contact number
          scholarSpecialization: specIds,
          scholarExperience: 5,
          scholarEducation: eduIds,
          rating: 0,
          ProfileImg: PROFILE_IMG,
          fee: 0,
          blessings: 0,
          scholarServices: serIds,
          gender,
          sect,
        });
        console.log("🧪 Placeholder scholar created:", placeholder.scholarName);
      }
    }

    // Safely check what collections exist (TypeScript-safe)
    const db = mongoose.connection.db;
    if (db) {
      const collections = await db.listCollections().toArray();
      console.log("📂 Collections now in barakahDB:", collections.map((c) => c.name));
    }

    await mongoose.disconnect();
    console.log("✅ Done and disconnected");
  } catch (err) {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  }
}

seed();
