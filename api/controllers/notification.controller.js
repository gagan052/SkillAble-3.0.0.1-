import Notification from "../models/notification.model.js";
import createError from "../utils/createError.js";

// Get all notifications for the current user
export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.userId })
      .sort({ createdAt: -1 })
      .populate("sender", "username img");
    res.status(200).send(notifications);
  } catch (err) {
    next(err);
  }
};

// Create a new notification
export const createNotification = async (req, res, next) => {
  try {
    const { recipient, type, content, entityId } = req.body;
    
    if (!recipient || !type || !content) {
      return next(createError(400, "Missing required fields"));
    }
    
    const newNotification = new Notification({
      recipient,
      sender: req.userId,
      type,
      content,
      entityId,
      read: false,
    });
    
    await newNotification.save();
    res.status(201).send(newNotification);
  } catch (err) {
    next(err);
  }
};

// Mark a notification as read
export const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return next(createError(404, "Notification not found"));
    }
    
    if (notification.recipient.toString() !== req.userId) {
      return next(createError(403, "You can only mark your own notifications as read"));
    }
    
    notification.read = true;
    await notification.save();
    
    res.status(200).send(notification);
  } catch (err) {
    next(err);
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.userId, read: false },
      { read: true }
    );
    
    res.status(200).send({ message: "All notifications marked as read" });
  } catch (err) {
    next(err);
  }
};

// Delete a notification
export const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return next(createError(404, "Notification not found"));
    }
    
    if (notification.recipient.toString() !== req.userId) {
      return next(createError(403, "You can only delete your own notifications"));
    }
    
    await Notification.findByIdAndDelete(req.params.id);
    
    res.status(200).send({ message: "Notification deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// Helper function to create notifications from other controllers
export const createNotificationHelper = async (recipientId, senderId, type, content, entityId) => {
  try {
    const newNotification = new Notification({
      recipient: recipientId,
      sender: senderId,
      type,
      content,
      entityId,
      read: false,
    });
    
    await newNotification.save();
    return newNotification;
  } catch (err) {
    console.error("Error creating notification:", err);
    return null;
  }
};