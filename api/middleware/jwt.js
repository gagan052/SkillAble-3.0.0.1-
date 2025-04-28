import jwt from "jsonwebtoken";
import createError from "../utils/createError.js";
import mongoose from "mongoose";

export const verifyToken = (req, res, next) => {
  // Try to get token from Authorization header first
  const authHeader = req.headers.authorization;
  let token;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else {
    // Fallback to cookie if no Authorization header
    token = req.cookies.accessToken;
  }

  if (!token) {
    return next(createError(401, "You are not authenticated!"));
  }

  jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
    if (err) {
      return next(createError(403, "Token is not valid!"));
    }

    // Validate the user ID format
    if (!mongoose.Types.ObjectId.isValid(payload.id)) {
      return next(createError(400, "Invalid user ID format in token"));
    }

    req.userId = payload.id;
    req.isSeller = payload.isSeller;
    next();

  });
};
