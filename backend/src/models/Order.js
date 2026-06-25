import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: String,
        image: String,
        price: Number,
        quantity: Number
      }
    ],
    shippingAddress: { type: String, required: true },
    phone: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    status: { type: String, default: "Processing" },
    paymentMethod: { type: String, default: "Cash on Delivery" }
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
