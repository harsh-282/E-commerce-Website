import mongoose from "mongoose";

const connectDB = async () => {
  const url = process.env.MONGODB_URL|| process.env.MONGODB_URL;
  if (!url) throw new Error("MONGODB_URL or MONGODB_URL is missing in .env");
  await mongoose.connect(url);
  console.log("MongoDB connected");
};

export default connectDB;
