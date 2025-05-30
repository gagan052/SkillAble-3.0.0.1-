import SavedGig from "../models/savedGig.model.js";
import Gig from "../models/gig.model.js";
import User from "../models/user.model.js";
import createError from "../utils/createError.js";
import mongoose from "mongoose";
import { createNotificationHelper } from "./notification.controller.js";

// Save or unsave a gig
export const toggleSaveGig = async (req, res, next) => {
  try {
    if (!req.userId) return next(createError(401, "You must be logged in!"));
    
    const gigId = req.params.id;
    if (!gigId) return next(createError(400, "Gig ID is required"));
    
    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(req.userId) || !mongoose.Types.ObjectId.isValid(gigId)) {
      return next(createError(400, "Invalid ID format"));
    }
    
    // Check if gig exists
    const gig = await Gig.findById(gigId);
    if (!gig) return next(createError(404, "Gig not found!"));
    
    // Check if user exists
    const user = await User.findById(req.userId);
    if (!user) return next(createError(404, "User not found!"));
    
    // Check if the gig is already saved
    const savedGig = await SavedGig.findOne({ userId: req.userId, gigId });
    
    if (savedGig) {
      // Unsave the gig
      await SavedGig.findByIdAndDelete(savedGig._id);
      
      res.status(200).json({ 
        message: "Gig has been unsaved!", 
        isSaved: false,
        gigId
      });
    } else {
      // Save the gig
      const newSavedGig = new SavedGig({
        userId: req.userId,
        gigId
      });
      
      await newSavedGig.save();
      
      // Create notification for the gig owner
      const user = await User.findById(req.userId);
      await createNotificationHelper(
        gig.userId,
        req.userId,
        "save",
        `${user.username} saved your gig "${gig.title}"`,
        gigId
      );
      
      res.status(200).json({ 
        message: "Gig has been saved!", 
        isSaved: true,
        gigId
      });
    }
  } catch (err) {
    // Handle duplicate key error (user trying to save the same gig twice)
    if (err.code === 11000) {
      return res.status(200).json({
        message: "Gig is already saved",
        isSaved: true,
        gigId: req.params.id
      });
    }
    
    console.error("Error in toggleSaveGig:", err);
    next(err);
  }
};

// Get all saved gigs for the current user
export const getSavedGigs = async (req, res, next) => {
  try {
    if (!req.userId) {
      return next(createError(401, "You must be logged in!"));
    }

    // Validate user ID format
    if (!mongoose.Types.ObjectId.isValid(req.userId)) {
      return next(createError(400, "Invalid user ID format"));
    }

    // Find all saved gigs for this user
    const savedGigs = await SavedGig.find({ userId: req.userId });
    
    if (!savedGigs.length) {
      return res.status(200).send([]);
    }
    
    // Extract gig IDs
    const gigIds = savedGigs.map(item => item.gigId);
    
    // Get the actual gig data
    const gigs = await Gig.find({
      _id: { $in: gigIds }
    }).select('_id title desc price cover totalStars starNumber shortTitle shortDesc deliveryTime revisionNumber features sales');

    res.status(200).send(gigs);
  } catch (err) {
    console.error("Error in getSavedGigs:", err);
    next(err);
  }
};

// Check if a gig is saved by the current user
export const checkSavedGig = async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(200).json({ isSaved: false });
    }
    
    const gigId = req.params.id;
    if (!gigId) return next(createError(400, "Gig ID is required"));
    
    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(req.userId) || !mongoose.Types.ObjectId.isValid(gigId)) {
      return next(createError(400, "Invalid ID format"));
    }
    
    // Check if the gig is saved
    const savedGig = await SavedGig.findOne({ userId: req.userId, gigId });
    
    res.status(200).json({ isSaved: !!savedGig });
  } catch (err) {
    console.error("Error in checkSavedGig:", err);
    next(err);
  }
};