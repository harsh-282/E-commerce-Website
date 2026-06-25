import Cart from "../models/Cart.js";

const getPopulatedCart = (userId) => Cart.findOne({ user: userId }).populate("items.product");

export const getCart = async (req, res) => {
  let cart = await getPopulatedCart(req.user._id);
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
  res.json(cart);
};

export const addToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
  const item = cart.items.find((entry) => entry.product.toString() === productId);
  if (item) item.quantity += Number(quantity);
  else cart.items.push({ product: productId, quantity });
  await cart.save();
  res.json(await getPopulatedCart(req.user._id));
};

export const updateCartItem = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  const item = cart?.items.id(req.params.itemId);
  if (item) item.quantity = Math.max(1, Number(req.body.quantity));
  await cart?.save();
  res.json(await getPopulatedCart(req.user._id));
};

export const removeCartItem = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.items = cart.items.filter((item) => item._id.toString() !== req.params.itemId);
    await cart.save();
  }
  res.json(await getPopulatedCart(req.user._id));
};
