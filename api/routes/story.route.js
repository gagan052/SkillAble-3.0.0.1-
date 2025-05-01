import express from "express";
import {
  createStory,
  getAllStories,
  getUserStories,
  viewStory,
  deleteStory
} from "../controllers/story.controller.js";
import { verifyToken } from "../middleware/jwt.js";

const router = express.Router();

// Create a new story (requires authentication)
router.post("/", verifyToken, createStory);

// Get all stories (visible to all)
router.get("/", getAllStories);

// Get all stories from a specific user
router.get("/user/:userId", getUserStories);

// Mark a story as viewed (requires authentication)
router.post("/:id/view", verifyToken, viewStory);

// Delete a story (requires authentication)
router.delete("/:id", verifyToken, deleteStory);

export default router; 