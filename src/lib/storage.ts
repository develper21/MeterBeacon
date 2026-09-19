import type { Tracker, TrackerHistory, Geofence, Notification, ActivityLog } from "@/shared/types";

const STORAGE_KEYS = {
  TRACKERS: "smtrack_trackers",
  TRACKER_HISTORY: "smtrack_tracker_history",
  GEOFENCES: "smtrack_geofences",
  NOTIFICATIONS: "smtrack_notifications",
  ACTIVITY_LOGS: "smtrack_activity_logs",
};

export const storage = {
  // Trackers
  getTrackers: (): Tracker[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.TRACKERS);
    return stored ? JSON.parse(stored) : [];
  },
  setTrackers: (trackers: Tracker[]) => {
    localStorage.setItem(STORAGE_KEYS.TRACKERS, JSON.stringify(trackers));
  },
  addTracker: (tracker: Tracker) => {
    const trackers = storage.getTrackers();
    trackers.push(tracker);
    storage.setTrackers(trackers);
  },
  updateTracker: (id: string, updates: Partial<Tracker>) => {
    const trackers = storage.getTrackers();
    const index = trackers.findIndex(t => t.id === id);
    if (index !== -1) {
      trackers[index] = { ...trackers[index], ...updates };
      storage.setTrackers(trackers);
    }
  },
  deleteTracker: (id: string) => {
    const trackers = storage.getTrackers().filter(t => t.id !== id);
    storage.setTrackers(trackers);
  },

  // Tracker History
  getTrackerHistory: (trackerId?: string): TrackerHistory[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.TRACKER_HISTORY);
    const history = stored ? JSON.parse(stored) : [];
    if (trackerId) {
      return history.filter((h: TrackerHistory) => h.tracker_id === trackerId);
    }
    return history;
  },
  setTrackerHistory: (history: TrackerHistory[]) => {
    localStorage.setItem(STORAGE_KEYS.TRACKER_HISTORY, JSON.stringify(history));
  },
  addTrackerHistory: (history: TrackerHistory) => {
    const historyData = storage.getTrackerHistory();
    historyData.push(history);
    storage.setTrackerHistory(historyData);
  },

  // Geofences
  getGeofences: (): Geofence[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.GEOFENCES);
    return stored ? JSON.parse(stored) : [];
  },
  setGeofences: (geofences: Geofence[]) => {
    localStorage.setItem(STORAGE_KEYS.GEOFENCES, JSON.stringify(geofences));
  },
  addGeofence: (geofence: Geofence) => {
    const geofences = storage.getGeofences();
    geofences.push(geofence);
    storage.setGeofences(geofences);
  },
  updateGeofence: (id: string, updates: Partial<Geofence>) => {
    const geofences = storage.getGeofences();
    const index = geofences.findIndex(g => g.id === id);
    if (index !== -1) {
      geofences[index] = { ...geofences[index], ...updates };
      storage.setGeofences(geofences);
    }
  },
  deleteGeofence: (id: string) => {
    const geofences = storage.getGeofences().filter(g => g.id !== id);
    storage.setGeofences(geofences);
  },

  // Notifications
  getNotifications: (): Notification[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return stored ? JSON.parse(stored) : [];
  },
  setNotifications: (notifications: Notification[]) => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  },
  addNotification: (notification: Notification) => {
    const notifications = storage.getNotifications();
    notifications.push(notification);
    storage.setNotifications(notifications);
  },
  markNotificationRead: (id: string) => {
    const notifications = storage.getNotifications();
    const index = notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      notifications[index].is_read = true;
      storage.setNotifications(notifications);
    }
  },
  markAllNotificationsRead: () => {
    const notifications = storage.getNotifications().map(n => ({ ...n, is_read: true }));
    storage.setNotifications(notifications);
  },

  // Activity Logs
  getActivityLogs: (): ActivityLog[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOGS);
    return stored ? JSON.parse(stored) : [];
  },
  setActivityLogs: (logs: ActivityLog[]) => {
    localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(logs));
  },
  addActivityLog: (log: ActivityLog) => {
    const logs = storage.getActivityLogs();
    logs.push(log);
    storage.setActivityLogs(logs);
  },

  // Clear all data
  clearAll: () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },
};
