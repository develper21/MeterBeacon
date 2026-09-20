import { useState } from "react";
import { 
  Bell, 
  Battery, 
  MapPin, 
  RefreshCw, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  Copy, 
  Check, 
  Trash2, 
  ExternalLink,
  Clock,
  Radio,
  Share2
} from "lucide-react";
import type { Notification } from "@/shared/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { useNavigate } from "react-router-dom";

interface NotificationDetailDialogProps {
  notification: Notification | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleRead: (id: string, isRead: boolean) => void;
  onDelete?: (id: string) => void;
}

export function NotificationDetailDialog({
  notification,
  isOpen,
  onClose,
  onToggleRead,
  onDelete,
}: NotificationDetailDialogProps) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  if (!notification) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(notification.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Determine severity and icons based on notification type / content
  const getTypeConfig = (type: string, title: string) => {
    const lowerTitle = title.toLowerCase();
    if (type === "battery_alert" || lowerTitle.includes("critical") || lowerTitle.includes("low battery")) {
      return {
        icon: <Battery className="w-5 h-5 text-destructive" />,
        badge: "Critical Alert",
        badgeClass: "bg-destructive/15 text-destructive border-destructive/30",
        headerBg: "bg-destructive/10",
      };
    }
    if (type === "geofence_alert" || lowerTitle.includes("geofence") || lowerTitle.includes("breach")) {
      return {
        icon: <AlertTriangle className="w-5 h-5 text-warning" />,
        badge: "Geofence Perimeter Alert",
        badgeClass: "bg-warning/15 text-warning border-warning/30",
        headerBg: "bg-warning/10",
      };
    }
    if (type === "status_change" || lowerTitle.includes("status") || lowerTitle.includes("transit")) {
      return {
        icon: <RefreshCw className="w-5 h-5 text-info" />,
        badge: "Status Update",
        badgeClass: "bg-info/15 text-info border-info/30",
        headerBg: "bg-info/10",
      };
    }
    return {
      icon: <Settings className="w-5 h-5 text-primary" />,
      badge: "System Event",
      badgeClass: "bg-primary/15 text-primary border-primary/30",
      headerBg: "bg-primary/10",
    };
  };

  const config = getTypeConfig(notification.type, notification.title);
  const formattedDate = new Date(notification.created_at).toLocaleString("en-IN", {
    dateStyle: "full",
    timeStyle: "medium",
  });

  const handleViewDevice = () => {
    onClose();
    if (notification.device_id) {
      navigate(`/trackers?search=${encodeURIComponent(notification.device_id)}`);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[540px] glass-card border-border/60 p-0 overflow-hidden">
        {/* Top Banner */}
        <div className={`p-6 border-b border-border/30 ${config.headerBg} flex items-start gap-4`}>
          <div className="p-3 rounded-2xl bg-card border border-border/40 shadow-sm">
            {config.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className={`badge-glass text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ${config.badgeClass}`}>
                {config.badge}
              </span>
              {notification.is_read ? (
                <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium bg-muted/40 px-2 py-0.5 rounded-full">
                  <CheckCircle className="w-3 h-3 text-success" /> Read
                </span>
              ) : (
                <span className="text-[10px] text-primary flex items-center gap-1 font-semibold bg-primary/15 px-2 py-0.5 rounded-full border border-primary/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Unread
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-foreground leading-snug">
              {notification.title}
            </h2>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Notification ID bar */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-secondary/30 border border-border/40 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-muted-foreground font-semibold">Notification ID:</span>
              <span className="font-mono text-foreground font-semibold truncate select-all">
                #{notification.id}
              </span>
            </div>
            <button
              onClick={handleCopyId}
              className="px-2.5 py-1 rounded-lg bg-background/80 hover:bg-background text-foreground border border-border/40 flex items-center gap-1.5 text-[11px] font-medium transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy ID"}
            </button>
          </div>

          {/* Full Message */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Alert Details & Message
            </label>
            <div className="p-4 rounded-xl bg-secondary/20 border border-border/40 text-sm text-foreground leading-relaxed">
              {notification.message}
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-card border border-border/40 space-y-1">
              <span className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                <Clock className="w-3.5 h-3.5 text-primary" /> Timestamp
              </span>
              <p className="font-medium text-foreground text-[12px]">{formattedDate}</p>
            </div>

            <div className="p-3 rounded-xl bg-card border border-border/40 space-y-1">
              <span className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                <Radio className="w-3.5 h-3.5 text-primary" /> Associated Device
              </span>
              {notification.device_id ? (
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-foreground text-sm text-primary">
                    {notification.device_id}
                  </span>
                  <button
                    onClick={handleViewDevice}
                    className="text-[11px] text-primary hover:underline flex items-center gap-1 font-semibold"
                  >
                    Locate <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <p className="text-muted-foreground italic">System-wide event</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="p-4 bg-secondary/20 border-t border-border/30 flex flex-wrap items-center justify-between gap-2 sm:justify-between">
          <div className="flex items-center gap-2">
            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete(notification.id);
                  onClose();
                }}
                className="px-3 py-2 rounded-xl text-xs font-medium text-destructive hover:bg-destructive/10 border border-destructive/20 transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            )}
            <button
              type="button"
              onClick={() => onToggleRead(notification.id, !notification.is_read)}
              className="px-3 py-2 rounded-xl text-xs font-medium bg-secondary/60 hover:bg-secondary text-foreground border border-border/40 transition-all"
            >
              Mark as {notification.is_read ? "Unread" : "Read"}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {notification.device_id && (
              <button
                type="button"
                onClick={handleViewDevice}
                className="btn-glow px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-md transition-all"
              >
                <Radio className="w-3.5 h-3.5" />
                View Tracker
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium bg-background border border-border/60 hover:bg-secondary/40 text-foreground transition-all"
            >
              Close
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
