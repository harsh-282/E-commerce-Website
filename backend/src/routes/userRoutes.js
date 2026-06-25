import express from "express";
import { adminOnly, protect } from "../middleware/auth.js";
import { allUsers } from "../controllers/userController.js";

const router = express.Router();

router.get("/", protect, adminOnly, allUsers);

export default router;
