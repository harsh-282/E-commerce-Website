import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    category: {
      type: String,
      enum: ["Birthday Gifts", "Personalized Gifts", "Gift Hampers", "Home Decor", "Soft Toys"],
      required: true
    },
    stock: { type: Number, default: 10 },
    featured: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
