import express from "express";
import { verifyToken } from "../middleware/jwt.js";
import {
  sendMessage,
  getConversationHistory,
  getUserConversations,
  deleteConversation,
} from "../controllers/chat.controller.js";

const router = express.Router();

// Send a message to the AI assistant
router.post("/", sendMessage);

// Get conversation history (optional authentication)
router.get("/conversation/:conversationId", getConversationHistory);

// Get user's conversations (requires authentication)
router.get("/user/:userId", verifyToken, getUserConversations);

// Delete a conversation (requires authentication)
router.delete("/conversation/:conversationId", verifyToken, deleteConversation);

export default router; 