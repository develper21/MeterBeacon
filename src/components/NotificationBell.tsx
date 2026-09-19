import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { useAuth } from "@/features/auth";
import type { Notification } from "@/shared/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";

const NOTIFICATIONS_STORAGE_KEY = "smtrack_notifications";

const getNotifications = (): Notification[] => {
  const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveNotifications = (notifications: Notification[]) => {
  localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
};

export function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const stored = getNotifications();
    setNotifications(stored.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ).slice(0, 20));
  }, [user]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAllRead = () => {
    const updated = notifications.map(n => ({ ...n, is_read: true }));
    setNotifications(updated);
    saveNotifications(updated);
  };

  const typeIcon: Record<string, string> = {
    battery_alert: "🔋",
    geofence_alert: "📍",
    status_change: "🔄",
    system: "⚙️",
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative glass-card-hover p-2 rounded-lg">
          <Bell className="w-4 h-4 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-[9px] text-destructive-foreground flex items-center justify-center font-bold">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 glass-card border-border/50" align="end">
        <div className="flex items-center justify-between p-3 border-b border-border/30">
          <h4 className="text-sm font-semibold text-foreground">Notifications</h4>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-[10px] text-primary hover:underline">
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-72 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="p-4 text-xs text-muted-foreground text-center">No notifications yet</p>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                className={`p-3 border-b border-border/20 hover:bg-secondary/20 transition-colors ${!n.is_read ? "bg-primary/5" : ""}`}
              >
                <div className="flex gap-2">
                  <span className="text-sm">{typeIcon[n.type] || "📢"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{n.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{n.message}</p>
                    <p className="text-[9px] text-muted-foreground mt-1 font-mono">
                      {new Date(n.created_at).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
