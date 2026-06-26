import express from "express";
import multer from "multer";
import { adminOnly, protect } from "../middleware/auth.js";
import { createProduct, deleteProduct, getProduct, listProducts, updateProduct } from "../controllers/productController.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/", listProducts);
router.get("/:id", getProduct);
router.post("/", protect, adminOnly, upload.single('image'), createProduct);
router.put("/:id", protect, adminOnly, upload.single('image'), updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

export default router;
