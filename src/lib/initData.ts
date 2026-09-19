import { storage } from "./storage";
import type { Tracker, Geofence, Notification, ActivityLog } from "@/shared/types";
import { mockTrackers, mockGeofences } from "@/data/mockData";

export const initializeData = () => {
  // Initialize trackers if empty
  if (storage.getTrackers().length === 0) {
    const trackers: Tracker[] = mockTrackers.map(t => ({
      id: t.id,
      device_id: t.device_id,
      meter_id: t.meter_id,
      latitude: t.latitude,
      longitude: t.longitude,
      battery_level: t.battery_level,
      status: t.status,
      assigned_to: t.assigned_to || null,
      route: t.route || null,
      warehouse: t.warehouse || null,
      created_at: new Date().toISOString(),
      last_updated: t.last_updated,
    }));
    storage.setTrackers(trackers);
  }

  // Initialize geofences if empty
  if (storage.getGeofences().length === 0) {
    const geofences: Geofence[] = mockGeofences.map(g => ({
      id: g.id,
      name: g.name,
      lat: g.lat,
      lng: g.lng,
      radius: g.radius,
      type: g.type,
      alert_type: g.alert_type,
      created_by: null,
      created_at: new Date().toISOString(),
      tracker_count: g.tracker_count,
    }));
    storage.setGeofences(geofences);
  }

  // Initialize sample notifications if empty
  if (storage.getNotifications().length === 0) {
    const notifications: Notification[] = [
      {
        id: crypto.randomUUID(),
        type: "battery_alert",
        title: "Low Battery",
        message: "TRK-004 battery level is at 15%",
        device_id: "TRK-004",
        user_id: null,
        is_read: false,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        type: "geofence_alert",
        title: "Geofence Exit",
        message: "TRK-006 exited Faridabad warehouse zone",
        device_id: "TRK-006",
        user_id: null,
        is_read: false,
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
    ];
    storage.setNotifications(notifications);
  }

  // Initialize sample activity logs if empty
  if (storage.getActivityLogs().length === 0) {
    const activities: ActivityLog[] = [
      {
        id: crypto.randomUUID(),
        user_id: null,
        entity_type: "tracker",
        entity_id: "TRK-001",
        action: "status_change",
        details: { old_status: "in_storage", new_status: "in_transit" },
        created_at: new Date().toISOString(),
      },
    ];
    storage.setActivityLogs(activities);
  }
};
