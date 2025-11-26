import { useState, useEffect } from "react";
import { Bell, CheckCircle2, X, AlertTriangle, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getNotifications, markAsRead, deleteNotification, markAllAsRead } from "@/services/notificationService";
import { useAuth } from "@/contexts/AuthContext";
import { getProjectById } from "@/services/projectService";
// Simple date formatter without date-fns dependency
const formatDate = (dateString: string, language: "ar" | "en") => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (language === "ar") {
    if (diffMins < 1) return "الآن";
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} يوم`;
    return date.toLocaleDateString("ar-SA");
  } else {
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US");
  }
};

interface NotificationsListProps {
  language: "en" | "ar";
}

const NotificationsList = ({ language }: NotificationsListProps) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(getNotifications(user?.id || ""));
  const [filter, setFilter] = useState<"all" | "unread" | "high">("all");

  useEffect(() => {
    // Refresh notifications every 2 seconds
    const interval = setInterval(() => {
      if (user?.id) {
        setNotifications(getNotifications(user.id));
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [user]);

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return n.status === "unread";
    if (filter === "high") return n.severity === "high";
    return true;
  });

  const handleMarkAsRead = (notificationId: string) => {
    if (user?.id) {
      markAsRead(notificationId, user.id);
      setNotifications(getNotifications(user.id));
    }
  };

  const handleDelete = (notificationId: string) => {
    if (user?.id) {
      deleteNotification(notificationId, user.id);
      setNotifications(getNotifications(user.id));
    }
  };

  const handleMarkAllAsRead = () => {
    if (user?.id) {
      markAllAsRead(user.id);
      setNotifications(getNotifications(user.id));
    }
  };

  const translations = {
    ar: {
      title: "الإشعارات",
      noNotifications: "لا توجد إشعارات",
      all: "الكل",
      unread: "غير مقروءة",
      high: "عالية الأولوية",
      markAllRead: "تحديد الكل كمقروء",
      markRead: "تحديد كمقروء",
      delete: "حذف",
      similarityAlert: "تنبيه تشابه",
      projectApproved: "تم الموافقة على المشروع",
      projectRejected: "تم رفض المشروع",
      projectNeedsRevision: "المشروع يحتاج مراجعة",
    },
    en: {
      title: "Notifications",
      noNotifications: "No notifications",
      all: "All",
      unread: "Unread",
      high: "High Priority",
      markAllRead: "Mark All as Read",
      markRead: "Mark as Read",
      delete: "Delete",
      similarityAlert: "Similarity Alert",
      projectApproved: "Project Approved",
      projectRejected: "Project Rejected",
      projectNeedsRevision: "Project Needs Revision",
    },
  };

  const t = translations[language];

  const getNotificationIcon = (type: string, severity: string) => {
    if (severity === "high") return <AlertTriangle className="h-5 w-5 text-red-400" />;
    if (type === "similarity_alert") return <Bell className="h-5 w-5 text-amber-400" />;
    return <Info className="h-5 w-5 text-blue-400" />;
  };

  const getNotificationTitle = (notification: any) => {
    // Check if this is a supervisor response notification
    if (notification.title && notification.title.includes("رد من المشرف") || notification.title.includes("Response from Supervisor")) {
      return notification.title;
    }
    
    switch (notification.type) {
      case "similarity_alert":
        return t.similarityAlert;
      case "project_approved":
        return t.projectApproved;
      case "project_rejected":
        return t.projectRejected;
      case "project_needs_revision":
        return t.projectNeedsRevision;
      default:
        return notification.title;
    }
  };

  // Get supervisor responses for a project
  const getSupervisorResponses = (projectId: string) => {
    const project = getProjectById(projectId);
    return project?.supervisor_responses || [];
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t.title}</h2>
        {notifications.filter((n) => n.status === "unread").length > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {t.markAllRead}
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          {t.all} ({notifications.length})
        </Button>
        <Button
          variant={filter === "unread" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("unread")}
        >
          {t.unread} ({notifications.filter((n) => n.status === "unread").length})
        </Button>
        <Button
          variant={filter === "high" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("high")}
        >
          {t.high} ({notifications.filter((n) => n.severity === "high").length})
        </Button>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <Card className="glass p-12 text-center">
          <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">{t.noNotifications}</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`glass p-4 border ${
                notification.status === "unread"
                  ? "border-primary/50 bg-primary/5"
                  : "border-white/10"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  {getNotificationIcon(notification.type, notification.severity)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{getNotificationTitle(notification)}</h3>
                      <Badge
                        variant={
                          notification.severity === "high"
                            ? "destructive"
                            : notification.severity === "medium"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {notification.severity}
                      </Badge>
                      {notification.status === "unread" && (
                        <Badge variant="default" className="bg-blue-500">
                          {language === "ar" ? "جديد" : "New"}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {notification.status === "unread" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(notification.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                  
                  {notification.metadata?.similarity_score && (
                    <div className="text-xs text-muted-foreground mb-2">
                      {language === "ar" ? "نسبة التشابه:" : "Similarity:"}{" "}
                      {(notification.metadata.similarity_score * 100).toFixed(0)}%
                    </div>
                  )}

                  {/* Show supervisor responses if available */}
                  {notification.project_id && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      {getSupervisorResponses(notification.project_id).map((response: any) => (
                        <div key={response.id} className="mb-2 p-2 bg-primary/10 rounded border border-primary/20">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-primary">
                              {language === "ar" ? "رد من المشرف:" : "Supervisor Response:"} {response.supervisor_name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(response.created_at, language)}
                            </span>
                          </div>
                          <p className="text-sm text-foreground">{response.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDate(notification.created_at, language)}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsList;

