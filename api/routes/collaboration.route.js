import express from "express";
import { verifyToken } from "../middleware/jwt.js";
import {
  createCollaboration,
  getCollaborations,
  getCollaboration,
  updateCollaboration,
  deleteCollaboration,
  applyForCollaboration,
  updateApplicationStatus,
  getUserApplications,
  deleteExpiredCollaborations,
} from "../controllers/collaboration.controller.js";

const router = express.Router();

// Create a new collaboration
router.post("/", verifyToken, createCollaboration);

// Manually trigger deletion of expired collaborations (for testing)
router.post("/delete-expired", deleteExpiredCollaborations);

// Get all collaborations (with optional filters)
router.get("/", getCollaborations);

// Get a single collaboration by ID
router.get("/single/:id", getCollaboration);

// Update a collaboration
router.put("/:id", verifyToken, updateCollaboration);

// Delete a collaboration
router.delete("/:id", verifyToken, deleteCollaboration);

// Apply for a role in a collaboration
router.post("/apply/:id", verifyToken, applyForCollaboration);

// Update application status (accept/reject)
router.put("/application/:id", verifyToken, updateApplicationStatus);

// Get collaborations where user has applied
router.get("/applications", verifyToken, getUserApplications);

export default router;