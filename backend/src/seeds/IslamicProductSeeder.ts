import mongoose from "mongoose";
import dotenv from "dotenv";
import { IslamicProduct } from "../models/IslamicProduct";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || (process.env.MONGODB_URI as string);

const sampleProducts = [
  // Prayer Mats & Caps
  {
    name: "Premium Velvet Prayer Mat",
    category: "Prayers Mats & Caps",
    actualPrice: 2500,
    salePrice: 2000,
    description: "Luxurious velvet prayer mat with intricate Turkish design. Soft and comfortable for daily prayers.",
    imageUrl: "https://res.cloudinary.com/debszasgn/image/upload/v1769516399/5b73a0a574a2dcb2266074cd9fa5b040ccbe3d82_musvlv.jpg",
    stock: 100
  },
  {
    name: "White Knit Kufi Cap",
    category: "Prayers Mats & Caps",
    actualPrice: 500,
    salePrice: 350,
    description: "Comfortable and breathable white knit prayer cap (Kufi). Elastic fit suitable for most sizes.",
    imageUrl: "https://res.cloudinary.com/debszasgn/image/upload/v1769516399/7e216fafb151b30e909938579ae55ec78f1a0998_tbxkdg.jpg",
    stock: 100
  },
  {
    name: "Padded Prayer Mat - Blue",
    category: "Prayers Mats & Caps",
    actualPrice: 3000,
    salePrice: 2700,
    description: "Extra padded prayer mat for joint support. Beautiful blue geometric pattern.",
    imageUrl: "https://res.cloudinary.com/debszasgn/image/upload/v1769516399/8da69203b6f6d16b3bb16da47d81bd0534d06f26_hrolmf.jpg",
    stock: 100
  },
  {
    name: "Embroidered Wool Cap",
    category: "Prayers Mats & Caps",
    actualPrice: 800,
    salePrice: 600,
    description: "These prayer caps from Pakistan are a stylish and sophisticated addition to your wardrobe. Made with precision detailing and heavy pleating, these cotton caps come in a variety of colors to match your outfit perfectly. Whether worn for religious purposes or as a fashionable accessory, these caps create a polished and regal look. Note: Please note that the color of the item you receive may vary slightly from that shown in the listing picture. This can happen due to the variation in light at the time of photography and photoshop. Things like Lace, Piping, or Embellishment might not be included unless stated in the description.",
    imageUrl: "https://res.cloudinary.com/debszasgn/image/upload/v1769684264/281edcfa-65d1-47fb-b6fe-4278aa9d214e.png",
    stock: 100
  },
  {
    name: "Travel Prayer Mat",
    category: "Prayers Mats & Caps",
    actualPrice: 1200,
    salePrice: 999,
    description: "Whatever the purpose of your travel be it business, holiday, or pilgrimage our Travel Prayer Mat helps you maintain your connection with Allah everywhere. Our Safri Janamaz is made for Muslims who pray regardless of location; it is made for portability and convenience.",
    imageUrl: "https://res.cloudinary.com/debszasgn/image/upload/v1769684380/d36b19b1-9e48-4e34-beba-87e2401e4163.png",
    stock: 0 // Out of stock
  },
  {
    name: "Black Kufi Cap",
    category: "Prayers Mats & Caps",
    actualPrice: 450,
    salePrice: 300,
    description: "These prayer caps from Pakistan are a stylish and sophisticated addition to your wardrobe. Made with precision detailing and heavy pleating, these cotton caps come in a variety of colors to match your outfit perfectly. Whether worn for religious purposes or as a fashionable accessory, these caps create a polished and regal look.",
    imageUrl: "https://res.cloudinary.com/debszasgn/image/upload/v1769684679/9f1c64f3-ad03-4ee7-8c48-04a2eee4c112.png",
    stock: 100
  },

  // Tasbih
  {
    name: "Wooden Tasbih Beads",
    category: "Tasbih",
    actualPrice: 400,
    salePrice: 250,
    description: "Handcrafted 33-bead wooden Tasbih. Smooth finish for comfortable Dhikr.",
    imageUrl: "https://res.cloudinary.com/debszasgn/image/upload/v1769684756/fb1311a3-ee2f-4e3e-9cb5-7cdb12b0de44.png",
    stock: 100
  },
  {
    name: "Crystal Tasbih - 99 Beads",
    category: "Tasbih",
    actualPrice: 1500,
    salePrice: 1200,
    description: "Beautiful 99-bead crystal Tasbih with tassel. Ideal for gifts.",
    imageUrl: "https://res.cloudinary.com/debszasgn/image/upload/v1769684841/ae5e4cf3-93a0-4ab8-8b9a-6f4507c518b6.png",
    stock: 100
  },

  // Accessories
  {
    name: "Silver Plated Ring",
    category: "Accessories",
    actualPrice: 2000,
    salePrice: 1500,
    description: "Men's silver plated ring with Islamic engraving.",
    imageUrl: "https://res.cloudinary.com/debszasgn/image/upload/v1769685204/2db6703c-69da-4bfe-a5a7-773c82506c1c.png",
    stock: 100
  },
  {
    name: "Oudh Perfume Oil",
    category: "Accessories",
    actualPrice: 3500,
    salePrice: 3000,
    description: "Pure Oudh fragrance oil (Attar). Long-lasting traditional scent.",
    imageUrl: "https://res.cloudinary.com/debszasgn/image/upload/v1769685035/60b5c027-1371-4f41-bc3c-6af87f233339.png",
    stock: 100
  },
  {
    name: "Digital Tally Counter",
    category: "Accessories",
    actualPrice: 300,
    salePrice: 150,
    description: "Electronic finger counter for easy tracking of Adhkar.",
    imageUrl: "https://res.cloudinary.com/debszasgn/image/upload/v1769685293/a6fb3eed-eb82-4404-a02a-a698b846d65c.png",
    stock: 100
  },
  {
    name: "Kaaba Key Chain",
    category: "Accessories",
    actualPrice: 200,
    salePrice: 100,
    description: "Metal key chain featuring the Kaaba design.",
    imageUrl: "https://res.cloudinary.com/debszasgn/image/upload/v1769685347/b4dfb1f2-abd9-462b-ae52-8b8830823d7a.png",
    stock: 100
  },

  // Islamic books & Literature
  {
    name: "The Holy Quran - Tajweed",
    category: "Islamic books & Literature",
    actualPrice: 2000,
    salePrice: 1800,
    description: "Color-coded Tajweed Quran to help with correct pronunciation and recitation.",
    imageUrl: "https://res.cloudinary.com/debszasgn/image/upload/v1769516400/3ced35ac20c2a61a85bf8d77d5eaca480118afb0_jmji9j.jpg",
    stock: 100
  },
  {
    name: "Fortress of the Muslim",
    category: "Islamic books & Literature",
    actualPrice: 600,
    salePrice: 450,
    description: "Pocket-sized collection of essential daily Duas (Hisn al-Muslim).",
    imageUrl: "https://res.cloudinary.com/debszasgn/image/upload/v1769685437/83d931c9-6a75-4c14-bf6d-69b69963ca8c.png",
    stock: 0 // Out of stock
  },
  {
    name: "Stories of the Prophets",
    category: "Islamic books & Literature",
    actualPrice: 1800,
    salePrice: 1500,
    description: "Comprehensive book detailing the lives of the Prophets in Islam.",
    imageUrl: "https://res.cloudinary.com/debszasgn/image/upload/v1769685479/272e9a01-afa3-4973-8d52-9c8a4d4d623e.png",
    stock: 100
  },
  {
    name: "Riyad-us-Saliheen",
    category: "Islamic books & Literature",
    actualPrice: 2500,
    salePrice: 2200,
    description: "Classic collection of Hadith compiled by Imam An-Nawawi.",
    imageUrl: "https://res.cloudinary.com/debszasgn/image/upload/v1769685504/e86f4431-dc7f-46fd-b303-9ef880b49f00.png",
    stock: 100
  },
  {
    name: "Islamic Manners",
    category: "Islamic books & Literature",
    actualPrice: 900,
    salePrice: 750,
    description: "Guide to Islamic etiquette and manners in daily life.",
    imageUrl: "https://res.cloudinary.com/debszasgn/image/upload/v1769685547/a2eefbb5-53b5-4550-bce1-9cc024c30645.png",
    stock: 0 // Out of stock
  },
  {
    name: "Seerah of Prophet Muhammad",
    category: "Islamic books & Literature",
    actualPrice: 2200,
    salePrice: 1900,
    description: "Biography of the Prophet Muhammad (PBUH) - The Sealed Nectar.",
    imageUrl: "https://res.cloudinary.com/debszasgn/image/upload/v1769685613/9f9bd705-cba7-4a01-ba69-33c40e8756aa.png",
    stock: 100
  }
];

const seedIslamicProducts = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");

    // Clear existing products
    await IslamicProduct.deleteMany({});
    console.log("🗑️ Cleared existing Islamic Products");

    // Insert new products
    await IslamicProduct.insertMany(sampleProducts);
    console.log(`✅ Seeded ${sampleProducts.length} Islamic Products successfully`);

    await mongoose.disconnect();
    console.log("✅ Done and disconnected");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding Islamic Products:", err);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedIslamicProducts();
