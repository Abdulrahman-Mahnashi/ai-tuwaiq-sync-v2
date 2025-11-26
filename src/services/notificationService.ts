// Service to manage notifications
export interface Notification {
  id: string;
  type: "similarity_alert" | "project_approved" | "project_rejected" | "project_needs_revision";
  recipient_id: string; // user ID
  project_id?: string;
  title: string;
  message: string;
  severity: "high" | "medium" | "low";
  status: "unread" | "read";
  created_at: string;
  read_at?: string;
  metadata?: {
    similarity_score?: number;
    matched_project_id?: string;
    matched_project_name?: string;
  };
}

const STORAGE_KEY = "tuwaiq_notifications";

// Get all notifications for a user
export const getNotifications = (userId: string): Notification[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const allNotifications: Notification[] = stored ? JSON.parse(stored) : [];
    return allNotifications.filter((n) => n.recipient_id === userId);
  } catch (error) {
    console.error("Error reading notifications:", error);
    return [];
  }
};

// Get unread notifications count
export const getUnreadCount = (userId: string): number => {
  return getNotifications(userId).filter((n) => n.status === "unread").length;
};

// Create a new notification
export const createNotification = (notification: Omit<Notification, "id" | "created_at">): Notification => {
  const notifications = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  
  const newNotification: Notification = {
    ...notification,
    id: `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    created_at: new Date().toISOString(),
  };

  notifications.push(newNotification);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  
  return newNotification;
};

// Mark notification as read
export const markAsRead = (notificationId: string, userId: string): boolean => {
  try {
    const notifications: Notification[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const notification = notifications.find(
      (n) => n.id === notificationId && n.recipient_id === userId
    );
    
    if (!notification) return false;
    
    notification.status = "read";
    notification.read_at = new Date().toISOString();
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    return true;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return false;
  }
};

// Mark all notifications as read for a user
export const markAllAsRead = (userId: string): boolean => {
  try {
    const notifications: Notification[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    
    notifications.forEach((n) => {
      if (n.recipient_id === userId && n.status === "unread") {
        n.status = "read";
        n.read_at = new Date().toISOString();
      }
    });
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    return true;
  } catch (error) {
    console.error("Error marking all as read:", error);
    return false;
  }
};

// Delete notification
export const deleteNotification = (notificationId: string, userId: string): boolean => {
  try {
    const notifications: Notification[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const filtered = notifications.filter(
      (n) => !(n.id === notificationId && n.recipient_id === userId)
    );
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error("Error deleting notification:", error);
    return false;
  }
};

