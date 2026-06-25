import express from "express";
import { adminOnly, protect } from "../middleware/auth.js";
import { createProduct, deleteProduct, getProduct, listProducts, updateProduct } from "../controllers/productController.js";

const router = express.Router();

router.get("/", listProducts);
router.get("/:id", getProduct);
router.post("/", protect, adminOnly, createProduct);
router.put("/:id", protect, adminOnly, updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

export default router;
