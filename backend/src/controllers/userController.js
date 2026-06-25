import User from "../models/User.js";

export const allUsers = async (_req, res) => {
  res.json(await User.find().select("-password").sort("-createdAt"));
};
