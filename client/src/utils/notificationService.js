// Notification service for handling notification operations
import newRequest from "./newRequest";

// Get all notifications for the current user
export const getNotifications = async () => {
  try {
    const response = await newRequest.get("/notifications");
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
};

// Mark a notification as read
export const markAsRead = async (notificationId) => {
  try {
    const response = await newRequest.put(`/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return null;
  }
};

// Mark all notifications as read
export const markAllAsRead = async () => {
  try {
    const response = await newRequest.put("/notifications/read-all");
    return response.data;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return null;
  }
};

// Delete a notification
export const deleteNotification = async (notificationId) => {
  try {
    const response = await newRequest.delete(`/notifications/${notificationId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting notification:", error);
    return null;
  }
};