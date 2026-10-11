import { beforeEach, describe, expect, it } from "vitest";
import { storage } from "@/shared/services/storage.service";
import type { Geofence, Notification, Tracker, TrackerHistory } from "@/shared/types";

const tracker: Tracker = {
  id: "tracker-1",
  device_id: "device-1",
  meter_id: "meter-1",
  latitude: 12.97,
  longitude: 77.59,
  battery_level: 82,
  status: "in_transit",
  assigned_to: null,
  route: null,
  warehouse: "Central",
  created_at: "2026-01-01T00:00:00.000Z",
  last_updated: "2026-01-01T00:00:00.000Z",
};

const notification: Notification = {
  id: "notification-1",
  type: "low_battery",
  title: "Low battery",
  message: "Tracker battery is low",
  device_id: tracker.device_id,
  user_id: null,
  is_read: false,
  created_at: "2026-01-01T00:00:00.000Z",
};

beforeEach(() => {
  storage.clearAll();
});

describe("tracker storage", () => {
  it("returns an empty list when no trackers are stored", () => {
    expect(storage.getTrackers()).toEqual([]);
  });

  it("adds, updates, and deletes trackers", () => {
    storage.addTracker(tracker);
    storage.updateTracker(tracker.id, { battery_level: 35, status: "installed_off" });

    expect(storage.getTrackers()).toEqual([
      { ...tracker, battery_level: 35, status: "installed_off" },
    ]);

    storage.updateTracker("missing", { battery_level: 1 });
    expect(storage.getTrackers()).toHaveLength(1);

    storage.deleteTracker(tracker.id);
    expect(storage.getTrackers()).toEqual([]);
  });
});

describe("tracker history storage", () => {
  it("returns all history or filters it by tracker id", () => {
    const history: TrackerHistory[] = [
      {
        id: "history-1",
        tracker_id: tracker.id,
        latitude: 12.97,
        longitude: 77.59,
        battery_level: 82,
        status: "in_transit",
        recorded_at: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "history-2",
        tracker_id: "tracker-2",
        latitude: 13.0,
        longitude: 77.6,
        battery_level: 75,
        status: "installed_off",
        recorded_at: "2026-01-01T01:00:00.000Z",
      },
    ];
    storage.setTrackerHistory(history);

    expect(storage.getTrackerHistory()).toEqual(history);
    expect(storage.getTrackerHistory(tracker.id)).toEqual([history[0]]);
    expect(storage.getTrackerHistory("unknown")).toEqual([]);
  });
});

describe("geofence storage", () => {
  it("adds, updates, and deletes geofences", () => {
    const geofence: Geofence = {
      id: "geofence-1",
      name: "Depot",
      lat: 12.97,
      lng: 77.59,
      radius: 500,
      type: "warehouse",
      alert_type: "entry",
      created_by: null,
      created_at: "2026-01-01T00:00:00.000Z",
    };

    storage.addGeofence(geofence);
    storage.updateGeofence(geofence.id, { radius: 750 });
    expect(storage.getGeofences()).toEqual([{ ...geofence, radius: 750 }]);

    storage.deleteGeofence(geofence.id);
    expect(storage.getGeofences()).toEqual([]);
  });
});

describe("notification storage", () => {
  it("marks one notification read without changing others", () => {
    const unread = { ...notification, id: "notification-2" };
    storage.setNotifications([notification, unread]);

    storage.markNotificationRead(notification.id);

    expect(storage.getNotifications()).toEqual([
      { ...notification, is_read: true },
      unread,
    ]);
  });

  it("marks all notifications read", () => {
    storage.setNotifications([notification]);

    storage.markAllNotificationsRead();

    expect(storage.getNotifications()).toEqual([{ ...notification, is_read: true }]);
  });
});

describe("clearAll", () => {
  it("removes every persisted data collection", () => {
    storage.setTrackers([tracker]);
    storage.setTrackerHistory([]);
    storage.setGeofences([]);
    storage.setNotifications([notification]);
    storage.setActivityLogs([]);

    storage.clearAll();

    expect(storage.getTrackers()).toEqual([]);
    expect(storage.getTrackerHistory()).toEqual([]);
    expect(storage.getGeofences()).toEqual([]);
    expect(storage.getNotifications()).toEqual([]);
    expect(storage.getActivityLogs()).toEqual([]);
  });
});
