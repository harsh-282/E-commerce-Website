import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import Product from "./src/models/Product.js";
import User from "./src/models/User.js";

dotenv.config();
await connectDB();

const adminEmail = process.env.ADMIN_EMAIL || "admin@giftify.com";
const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
const admin = await User.findOne({ email: adminEmail });
if (admin) {
  admin.name = "Giftify Admin";
  admin.password = adminPassword;
  admin.role = "admin";
  await admin.save();
} else {
  await User.create({ name: "Giftify Admin", email: adminEmail, password: adminPassword, role: "admin" });
}

await Product.deleteMany();
await Product.insertMany([
  {
    name: "Birthday Joy Box",
    description: "A cheerful birthday gift set with decor, treats, and a handwritten-style greeting card.",
    price: 1299,
    image: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=900&q=80",
    category: "Birthday Gifts",
    stock: 20,
    featured: true
  },
  {
    name: "Custom Name LED Lamp",
    description: "Personalized warm LED lamp for desks, bedrooms, and celebration corners.",
    price: 899,
    image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=900&q=80",
    category: "Personalized Gifts",
    stock: 15,
    featured: true
  },
  {
    name: "Premium Snack Hamper",
    description: "Curated sweet and savory hamper packed for festive gifting and office surprises.",
    price: 1799,
    image: "https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=900&q=80",
    category: "Gift Hampers",
    stock: 12
  },
  {
    name: "Ceramic Vase Set",
    description: "Minimal home decor vase set for shelves, bedside tables, and living rooms.",
    price: 1499,
    image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=80",
    category: "Home Decor",
    stock: 18
  },
  {
    name: "Cuddle Bear Plush",
    description: "Soft plush toy with a cozy finish, perfect for kids and thoughtful comfort gifts.",
    price: 699,
    image: "https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=900&q=80",
    category: "Soft Toys",
    stock: 25,
    featured: true
  }
]);

console.log("Seed complete");
process.exit();
