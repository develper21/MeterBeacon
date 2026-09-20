import { apiClient, ApiResponse } from "./api.client";
import type { Notification } from "@/shared/types";

export const normalizeNotification = (raw: any): Notification => {
  if (!raw) return raw;
  const isRead = typeof raw.is_read === "boolean" ? raw.is_read : Boolean(raw.isRead);
  const deviceId = raw.device_id || raw.trackerId || raw.tracker?.deviceId || null;
  const createdAt = raw.created_at || raw.createdAt || new Date().toISOString();

  let type = (raw.type || "system").toLowerCase();
  if (type === "low_battery") type = "battery_alert";
  if (type === "geofence_breach") type = "geofence_alert";
  if (type === "tracker_offline") type = "status_change";

  return {
    id: raw.id,
    type,
    title: raw.title,
    message: raw.message,
    device_id: deviceId,
    user_id: raw.userId || raw.user_id || null,
    is_read: isRead,
    created_at: createdAt,
  };
};

export const notificationService = {
  getNotifications: async (): Promise<Notification[]> => {
    try {
      const res = await apiClient.get<ApiResponse<any[]>>("/notifications");
      const list = res?.data || [];
      return list.map(normalizeNotification);
    } catch {
      return [];
    }
  },

  markAsRead: async (id: string): Promise<boolean> => {
    try {
      await apiClient.put(`/notifications/${id}/read`);
      return true;
    } catch {
      return false;
    }
  },

  deleteNotification: async (id: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/notifications/${id}`);
      return true;
    } catch {
      return false;
    }
  },
};
