import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, _res, next) => {
  try {
    const token = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null;
    if (!token) throw Object.assign(new Error("Not authorized"), { status: 401 });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) throw Object.assign(new Error("User not found"), { status: 401 });
    next();
  } catch (error) {
    next(Object.assign(error, { status: error.status || 401 }));
  }
};

export const adminOnly = (req, _res, next) => {
  if (req.user?.role !== "admin") return next(Object.assign(new Error("Admin access only"), { status: 403 }));
  next();
};
