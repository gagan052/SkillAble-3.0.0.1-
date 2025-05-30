import express from "express";
import { verifyToken } from "../middleware/jwt.js";
import {
  getNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../controllers/notification.controller.js";

const router = express.Router();

// Get all notifications for the current user
router.get("/", verifyToken, getNotifications);

// Create a new notification
router.post("/", verifyToken, createNotification);

// Mark a notification as read
router.put("/:id/read", verifyToken, markAsRead);

// Mark all notifications as read
router.put("/read-all", verifyToken, markAllAsRead);

// Delete a notification
router.delete("/:id", verifyToken, deleteNotification);

export default router;