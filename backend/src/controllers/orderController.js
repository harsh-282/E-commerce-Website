import Cart from "../models/Cart.js";
import Order from "../models/Order.js";

export const placeOrder = async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  if (!cart || cart.items.length === 0) return next(Object.assign(new Error("Cart is empty"), { status: 400 }));
  const items = cart.items.map(({ product, quantity }) => ({
    product: product._id,
    name: product.name,
    image: product.image,
    price: product.price,
    quantity
  }));
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const order = await Order.create({ user: req.user._id, items, totalAmount, ...req.body });
  cart.items = [];
  await cart.save();
  res.status(201).json(order);
};

export const myOrders = async (req, res) => {
  res.json(await Order.find({ user: req.user._id }).sort("-createdAt"));
};

export const allOrders = async (_req, res) => {
  res.json(await Order.find().populate("user", "name email").sort("-createdAt"));
};

export const updateOrderStatus = async (req, res, next) => {
  const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!order) return next(Object.assign(new Error("Order not found"), { status: 404 }));
  res.json(order);
};
