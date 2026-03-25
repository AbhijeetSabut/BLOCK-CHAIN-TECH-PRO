import jwt from "jsonwebtoken";
import { config } from "../config.js";

export const signToken = (user) =>
  jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
      name: user.name
    },
    config.jwtSecret,
    {
      expiresIn: "7d"
    }
  );
