import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { signToken } from "../utils/jwt.js";

const router = Router();

router.post(
  "/register",
  asyncHandler(async (request, response) => {
    const { name, email, password, confirmPassword } = request.body;

    if (!name || !email || !password || !confirmPassword) {
      response.status(400).json({ message: "All fields are required." });
      return;
    }

    if (password !== confirmPassword) {
      response.status(400).json({ message: "Passwords do not match." });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      response.status(409).json({ message: "An account with this email already exists." });
      return;
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password
    });

    response.status(201).json({
      token: signToken(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  })
);

router.post(
  "/login",
  asyncHandler(async (request, response) => {
    const { email, password } = request.body;

    if (!email || !password) {
      response.status(400).json({ message: "Email and password are required." });
      return;
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user || !(await user.comparePassword(password))) {
      response.status(401).json({ message: "Invalid email or password." });
      return;
    }

    response.json({
      token: signToken(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  })
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (request, response) => {
    response.json({
      user: {
        id: request.user._id,
        name: request.user.name,
        email: request.user.email
      }
    });
  })
);

export default router;
