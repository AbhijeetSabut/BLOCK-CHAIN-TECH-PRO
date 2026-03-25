import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { config } from "../config.js";

export const requireAuth = async (request, response, next) => {
  const authorization = request.headers.authorization ?? "";
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : null;

  if (!token) {
    response.status(401).json({ message: "Authentication required." });
    return;
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(payload.sub).select("-password");

    if (!user) {
      response.status(401).json({ message: "User account no longer exists." });
      return;
    }

    request.user = user;
    next();
  } catch (_error) {
    response.status(401).json({ message: "Invalid or expired token." });
  }
};
