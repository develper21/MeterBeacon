import { useState, useEffect } from "react";
import { Bell, Check, Trash2, ExternalLink, Sparkles } from "lucide-react";
import { useAuth } from "@/features/auth";
import type { Notification } from "@/shared/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { storage } from "@/shared/services/storage.service";
import { NotificationDetailDialog } from "./NotificationDetailDialog";
import { useSearchParams } from "react-router-dom";

export function NotificationBell() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [popoverOpen, setPopoverOpen] = useState<boolean>(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  // Sync notifications from storage
  const reloadNotifications = () => {
    const stored = storage.getNotifications();
    const sorted = stored.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    setNotifications(sorted);
    return sorted;
  };

  useEffect(() => {
    const list = reloadNotifications();

    // Check if notificationId is in URL query parameters
    const queryNotifId = searchParams.get("notificationId");
    if (queryNotifId) {
      const match = list.find((n) => n.id === queryNotifId);
      if (match) {
        setSelectedNotification(match);
        setDialogOpen(true);
      }
    }
  }, [user, searchParams]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAllRead = () => {
    storage.markAllNotificationsRead();
    reloadNotifications();
  };

  const handleNotificationClick = (notification: Notification) => {
    // 1. Mark as read
    if (!notification.is_read) {
      storage.markNotificationRead(notification.id);
    }
    const updated = reloadNotifications();
    const current = updated.find((n) => n.id === notification.id) || notification;

    // 2. Open full detail dialog with notification ID
    setSelectedNotification(current);
    setPopoverOpen(false);
    setDialogOpen(true);
  };

  const handleToggleRead = (id: string, isRead: boolean) => {
    const currentList = storage.getNotifications();
    const index = currentList.findIndex((n) => n.id === id);
    if (index !== -1) {
      currentList[index].is_read = isRead;
      storage.setNotifications(currentList);
      const updated = reloadNotifications();
      if (selectedNotification && selectedNotification.id === id) {
        setSelectedNotification({ ...selectedNotification, is_read: isRead });
      }
    }
  };

  const handleDeleteNotification = (id: string) => {
    const currentList = storage.getNotifications().filter((n) => n.id !== id);
    storage.setNotifications(currentList);
    reloadNotifications();
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
                <p className="text-xs text-muted-foreground">No notifications right now</p>
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
                  <div className="text-base p-1.5 rounded-xl bg-background/80 border border-border/40 h-fit">
                    {typeIcon[n.type] || "📢"}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className={`text-xs font-semibold truncate ${!n.is_read ? "text-foreground" : "text-muted-foreground"}`}>
                        {n.title}
                      </p>
                      <span className="text-[9px] font-mono text-muted-foreground shrink-0">
                        {new Date(n.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-1">
                      <span className="text-[9px] font-mono text-muted-foreground/70 truncate max-w-[120px]">
                        #{n.id.slice(0, 8)}...
                      </span>
                      <span className="text-[10px] text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                        Read full &rarr;
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-2.5 text-center border-t border-border/30 bg-secondary/15 text-[11px] text-muted-foreground">
              Click any notification to read full details & ID
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* Full Notification Detail Modal */}
      <NotificationDetailDialog
        notification={selectedNotification}
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onToggleRead={handleToggleRead}
        onDelete={handleDeleteNotification}
      />
    </>
  );
}
