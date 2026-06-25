import express from "express";
import { adminOnly, protect } from "../middleware/auth.js";
import { allOrders, myOrders, placeOrder, updateOrderStatus } from "../controllers/orderController.js";

const router = express.Router();

router.post("/", protect, placeOrder);
router.get("/my", protect, myOrders);
router.get("/", protect, adminOnly, allOrders);
router.put("/:id/status", protect, adminOnly, updateOrderStatus);

export default router;
