import express from "express";
import {
  toggleSaveGig,
  getSavedGigs,
  checkSavedGig
} from "../controllers/savedGig.controller.js";
import { verifyToken } from "../middleware/jwt.js";

const router = express.Router();

// Save or unsave a gig
router.put("/toggle/:id", verifyToken, toggleSaveGig);

// Get all saved gigs for the current user
router.get("/", verifyToken, getSavedGigs);

// Check if a gig is saved by the current user
router.get("/check/:id", verifyToken, checkSavedGig);

export default router;