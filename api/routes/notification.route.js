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

// Test endpoint to create sample notifications (for development only)
router.post("/test", verifyToken, async (req, res, next) => {
  try {
    const { createNotificationHelper } = await import("../controllers/notification.controller.js");
    
    const sampleNotifications = [
      {
        type: "follow",
        content: "JohnDoe started following you",
        entityId: req.userId
      },
      {
        type: "save",
        content: "Alice saved your gig 'Professional Logo Design'",
        entityId: req.userId
      },
      {
        type: "review",
        content: "Bob left a 5-star review on your gig 'Website Development'",
        entityId: req.userId
      },
      {
        type: "purchase",
        content: "Charlie purchased your gig 'Social Media Marketing'",
        entityId: req.userId
      }
    ];

    const createdNotifications = [];
    
    for (const notification of sampleNotifications) {
      const newNotification = await createNotificationHelper(
        req.userId,
        req.userId, // Using same user as sender for testing
        notification.type,
        notification.content,
        notification.entityId
      );
      if (newNotification) {
        createdNotifications.push(newNotification);
      }
    }

    res.status(201).json({
      message: "Test notifications created successfully",
      count: createdNotifications.length,
      notifications: createdNotifications
    });
  } catch (err) {
    next(err);
  }
});

export default router;