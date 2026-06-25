import Product from "../models/Product.js";

export const listProducts = async (req, res) => {
  const { category, search } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (search) filter.name = { $regex: search, $options: "i" };
  res.json(await Product.find(filter).sort("-createdAt"));
};

export const getProduct = async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(Object.assign(new Error("Product not found"), { status: 404 }));
  res.json(product);
};

export const createProduct = async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
};

export const updateProduct = async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!product) return next(Object.assign(new Error("Product not found"), { status: 404 }));
  res.json(product);
};

export const deleteProduct = async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return next(Object.assign(new Error("Product not found"), { status: 404 }));
  res.json({ message: "Product deleted" });
};
