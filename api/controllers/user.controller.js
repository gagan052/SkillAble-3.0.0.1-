import User from "../models/user.model.js";
import Gig from "../models/gig.model.js";
import createError from "../utils/createError.js";
import mongoose from "mongoose";

export const deleteUser = async (req, res, next) => {
  try {
    if (!req.params.id) {
      return next(createError(400, "User ID is required"));
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return next(createError(404, "User not found"));
    }

    if (req.userId !== user._id.toString()) {
      return next(createError(403, "You can delete only your account!"));
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).send("deleted.");
  } catch (err) {
    if (err.name === "CastError") {
      return next(createError(400, "Invalid user ID format"));
    }
    next(err);
  }
};

export const getUser = async (req, res, next) => {
  try {
    if (!req.params.id) {
      return next(createError(400, "User ID is required"));
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return next(createError(404, "User not found"));
    }

    res.status(200).send(user);
  } catch (err) {
    if (err.name === "CastError") {
      return next(createError(400, "Invalid user ID format"));
    }
    next(err);
  }
};
