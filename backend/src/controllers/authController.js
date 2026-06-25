import User from "../models/User.js";
import { createToken } from "../utils/token.js";

const userPayload = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  token: createToken(user)
});

export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, address } = req.body;
    if (await User.findOne({ email })) throw Object.assign(new Error("Email already registered"), { status: 400 });
    const user = await User.create({ name, email, password, phone, address });
    res.status(201).json(userPayload(user));
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      throw Object.assign(new Error("Invalid email or password"), { status: 401 });
    }
    res.json(userPayload(user));
  } catch (error) {
    next(error);
  }
};

export const profile = (req, res) => res.json(req.user);
