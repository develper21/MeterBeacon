import { useState, useEffect, useCallback } from "react";
import { Bell, Check, Trash2, ExternalLink, Sparkles } from "lucide-react";
import { useAuth } from "@/features/auth";
import type { Notification } from "@/shared/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { notificationService } from "@/shared/services/notification.service";
import { NotificationDetailDialog } from "./NotificationDetailDialog";
import { useSearchParams } from "react-router-dom";

export function NotificationBell() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [popoverOpen, setPopoverOpen] = useState<boolean>(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  // Sync notifications from backend API
  const reloadNotifications = useCallback(async () => {
    try {
      const list = await notificationService.getNotifications();
      const sorted = list.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setNotifications(sorted);
      return sorted;
    } catch {
      setNotifications([]);
      return [];
    }
  }, []);

  useEffect(() => {
    reloadNotifications().then((list) => {
      // Check if notificationId is in URL query parameters
      const queryNotifId = searchParams.get("notificationId");
      if (queryNotifId) {
        const match = list.find((n) => n.id === queryNotifId);
        if (match) {
          setSelectedNotification(match);
          setDialogOpen(true);
        }
      }
    });
  }, [user, searchParams, reloadNotifications]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.is_read);
    await Promise.all(unread.map((n) => notificationService.markAsRead(n.id)));
    reloadNotifications();
  };

  const handleNotificationClick = async (notification: Notification) => {
    // 1. Mark as read on backend
    if (!notification.is_read) {
      await notificationService.markAsRead(notification.id);
    }
    const updated = await reloadNotifications();
    const current = updated.find((n) => n.id === notification.id) || {
      ...notification,
      is_read: true,
    };

    // 2. Open full detail dialog with notification ID
    setSelectedNotification(current);
    setPopoverOpen(false);
    setDialogOpen(true);
  };

  const handleToggleRead = async (id: string, isRead: boolean) => {
    if (isRead) {
      await notificationService.markAsRead(id);
    }
    await reloadNotifications();
    if (selectedNotification && selectedNotification.id === id) {
      setSelectedNotification({ ...selectedNotification, is_read: isRead });
    }
  };

  const handleDeleteNotification = async (id: string) => {
    await notificationService.deleteNotification(id);
    await reloadNotifications();
    if (selectedNotification && selectedNotification.id === id) {
      setSelectedNotification(null);
      setDialogOpen(false);
    }
  };

  const typeIcon: Record<string, string> = {
    battery_alert: "🔋",
    geofence_alert: "📍",
    status_change: "🔄",
    system: "⚙️",
  };

  return (
    <>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <button 
            aria-label="Open Notifications"
            className="relative glass-card-hover p-2.5 rounded-xl border border-border/40 transition-all hover:border-primary/40 focus:outline-none"
          >
            <Bell className="w-4 h-4 text-foreground/80" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-[9px] text-destructive-foreground flex items-center justify-center font-bold shadow-md animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        </PopoverTrigger>

        <PopoverContent className="w-88 sm:w-96 p-0 glass-card border-border/60 shadow-2xl rounded-2xl" align="end">
          {/* Header */}
          <div className="flex items-center justify-between p-3.5 border-b border-border/30 bg-card/60">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-foreground">Notifications</h4>
              {unreadCount > 0 && (
                <span className="badge-glass text-primary text-[10px] font-mono px-2 py-0.5">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button 
                onClick={markAllRead} 
                className="text-[11px] text-primary hover:text-primary/80 font-medium transition-colors flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-border/20">
            {notifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <Bell className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                <p className="text-xs font-medium text-muted-foreground">No notifications right now</p>
                <p className="text-[11px] text-muted-foreground/60">All system telemetry alerts will appear here</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3.5 transition-all cursor-pointer flex gap-3 group hover:bg-secondary/40 ${
                    !n.is_read ? "bg-primary/5 border-l-2 border-l-primary" : ""
                  }`}
                >
                  <span className="text-base select-none mt-0.5">{typeIcon[n.type] || "🔔"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className={`text-xs truncate ${!n.is_read ? "font-bold text-foreground" : "font-medium text-foreground/80"}`}>
                        {n.title}
                      </p>
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground font-mono">
                      <span>{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {n.device_id && (
                        <>
                          <span>&bull;</span>
                          <span className="font-semibold text-primary">{n.device_id}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer note */}
          <div className="p-2.5 border-t border-border/30 bg-muted/20 text-center text-[10px] text-muted-foreground">
            Click any notification to open its full ID view and details
          </div>
        </PopoverContent>
      </Popover>

      {/* Full Notification Detail Modal Dialog */}
      <NotificationDetailDialog
        notification={selectedNotification}
        isOpen={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          // Clean up search param if it matches
          if (searchParams.get("notificationId")) {
            searchParams.delete("notificationId");
            setSearchParams(searchParams);
          }
        }}
        onToggleRead={handleToggleRead}
        onDelete={handleDeleteNotification}
      />
    </>
  );
}
