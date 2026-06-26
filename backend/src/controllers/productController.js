import Product from "../models/Product.js";
import { uploadStream } from "../utils/cloudinary.js";

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

export const createProduct = async (req, res, next) => {
  try {
    const productData = { ...req.body };
    if (req.file) {
      const uploadResult = await uploadStream(req.file.buffer, 'products');
      productData.image = uploadResult.secure_url;
    }
    const product = await Product.create(productData);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const productData = { ...req.body };
    if (req.file) {
      const uploadResult = await uploadStream(req.file.buffer, 'products');
      productData.image = uploadResult.secure_url;
    }
    const product = await Product.findByIdAndUpdate(req.params.id, productData, { new: true, runValidators: true });
    if (!product) return next(Object.assign(new Error("Product not found"), { status: 404 }));
    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return next(Object.assign(new Error("Product not found"), { status: 404 }));
  res.json({ message: "Product deleted" });
};
