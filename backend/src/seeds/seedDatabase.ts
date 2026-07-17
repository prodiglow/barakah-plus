import mongoose from "mongoose";
import { Event } from "../models/Event";
import { EventParticipant } from "../models/EventParticipant";
import User from "../models/User";

const MONGO_URI =
  (process.env.MONGODB_URI as string);

async function seedDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // 🧹 Clear old data
    await Event.deleteMany({});
    await EventParticipant.deleteMany({});
    console.log("🧹 Cleared old Events and Participants");

    // 🔁 Reset eventID counter to start from 11
    const Counter = mongoose.connection.collection("counters");

    // 🌱 Create sample events
    const events = await Event.insertMany([
      {
        eventID: 1,
        eventTitle: "Quran Khwani and 11,000 Istighfar Recitations",
        eventSpecial: "Special Isal-e-Sawab for Your Ancestors",
        eventFor:
          "For the peace of departed souls and protection from unseen harms",
        eventLocation: "Masjid Al-Kabir, Kashi (Pakistan)",
        eventDate: new Date("2025-11-25"),
        eventPic:
          "https://res.cloudinary.com/debszasgn/image/upload/v1760365237/BarakahUploads/rxiz2fceihkfej06ceyz.jpg",
      },
      {
        eventID: 2,
        eventTitle: "Surah Yaseen & Ruqyah Recitations by 11 Huffaz",
        eventSpecial: "Dua for Healing and Protection",
        eventFor:
          "Blessings for shifa, baraka in life, and spiritual protection from Illness",
        eventLocation: "Madinah Healing Center, Khandwa, Lahore",
        eventDate: new Date("2025-12-05"),
        eventPic:
          "https://res.cloudinary.com/debszasgn/image/upload/v1760365237/BarakahUploads/rxiz2fceihkfej06ceyz.jpg",
      },
      {
        eventID: 3,
        eventTitle: "Quranic Supplications & Surah Al-Fath Recitation",
        eventSpecial: "Special Duas for Justice and Reconciliation",
        eventFor:
          "Pray for success in legal matters, justice, and removal of enmity",
        eventLocation: "Masjid Shifa, Ujjain, Madhya Pradesh",
        eventDate: new Date("2026-01-20"),
        eventPic:
          "https://res.cloudinary.com/debszasgn/image/upload/v1760365237/BarakahUploads/rxiz2fceihkfej06ceyz.jpg",
      },
      {
        eventID: 4,
        eventTitle: "Khatam-e-Quran for Blessings and Mercy",
        eventSpecial: "Dua for Rizq and Baraka",
        eventFor:
          "A blessed gathering to increase sustenance and spiritual mercy",
        eventLocation: "Noor Masjid, Karachi",
        eventDate: new Date("2026-02-10"),
        eventPic:
          "https://res.cloudinary.com/debszasgn/image/upload/v1760365237/BarakahUploads/rxiz2fceihkfej06ceyz.jpg",
      },
      {
        eventID: 5,
        eventTitle: "Dua-e-Shifa with Surah Al-Rahman Recitation",
        eventSpecial: "Special Healing Event",
        eventFor: "Prayers for health, peace, and recovery from illness",
        eventLocation: "Masjid Al-Rehman, Islamabad",
        eventDate: new Date("2026-03-05"),
        eventPic:
          "https://res.cloudinary.com/debszasgn/image/upload/v1760365237/BarakahUploads/rxiz2fceihkfej06ceyz.jpg",
      },
      {
        eventID: 6,
        eventTitle: "Collective Istighfar and Quran Tilawat",
        eventSpecial: "Special Forgiveness Gathering",
        eventFor: "Prayers for forgiveness and spiritual elevation",
        eventLocation: "Jami Masjid, Lahore",
        eventDate: new Date("2026-03-25"),
        eventPic:
          "https://res.cloudinary.com/debszasgn/image/upload/v1760365237/BarakahUploads/rxiz2fceihkfej06ceyz.jpg",
      },
      {
        eventID: 7,
        eventTitle: "Surah Yaseen Khwani for Protection",
        eventSpecial: "Dua for Safety and Peace",
        eventFor: "Prayers to protect families and communities from harm",
        eventLocation: "Masjid Al-Safa, Faisalabad",
        eventDate: new Date("2026-04-10"),
        eventPic:
          "https://res.cloudinary.com/debszasgn/image/upload/v1760365237/BarakahUploads/rxiz2fceihkfej06ceyz.jpg",
      },
      {
        eventID: 8,
        eventTitle: "Quran Khwani for Shuhada",
        eventSpecial: "Tribute to Martyrs",
        eventFor: "Dua for martyrs and their families",
        eventLocation: "Jamia Masjid, Rawalpindi",
        eventDate: new Date("2026-05-15"),
        eventPic:
          "https://res.cloudinary.com/debszasgn/image/upload/v1760365237/BarakahUploads/rxiz2fceihkfej06ceyz.jpg",
      },
      {
        eventID: 9,
        eventTitle: "Laylatul Qadr Special Quran Recitation",
        eventSpecial: "Dua for Maghfirah",
        eventFor: "Blessings of the most powerful night — Laylatul Qadr",
        eventLocation: "Masjid An-Noor, Multan",
        eventDate: new Date("2026-06-10"),
        eventPic:
          "https://res.cloudinary.com/debszasgn/image/upload/v1760365237/BarakahUploads/rxiz2fceihkfej06ceyz.jpg",
      },
      {
        eventID: 10,
        eventTitle: "Dua-e-Hajat & Quran Khwani",
        eventSpecial: "Special Prayer for Needs",
        eventFor: "Prayers for the fulfillment of personal duas and rizq",
        eventLocation: "Masjid Al-Huda, Peshawar",
        eventDate: new Date("2026-07-01"),
        eventPic:
          "https://res.cloudinary.com/debszasgn/image/upload/v1760365237/BarakahUploads/rxiz2fceihkfej06ceyz.jpg",
      },
    ]);

    console.log("🌱 Seeded Events");

    // 🔍 Get users
    const users = await User.find({}).limit(1);
    console.log(`🔍 Found ${users.length} users for participant seeding.`);

    if (users.length) {
      const participants = await EventParticipant.insertMany([
        {
          event: events[0]._id,
          user: users[0]._id,
          role: "attendee",
        },
      ]);

      console.log("🌱 Seeded Event Participants");

      const participantIds = participants.map((p) => p.user);
      await Event.findByIdAndUpdate(events[0]._id, {
        $push: { participants: { $each: participantIds } },
      });

      console.log("🔗 Linked participants to event");
    } else {
      console.log("⚠️ No users found — skipping participant seeding.");
    }
    await Counter.updateOne(
      { _id: "eventID" as any },
      { $set: { seq: 11 } },
      { upsert: true }
    );
    console.log(
      "🔢 Counter reset successfully (next eventID will start from 11)"
    );
    console.log("🎉 Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
