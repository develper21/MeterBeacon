import { storage } from "./storage.service";
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
        id: "notif-bat-007",
        type: "battery_alert",
        title: "Critical Battery Level Warning",
        message: "Tracker TRK-007 installed at Sector 14 Faridabad has reached a critically low battery level of 8%. Immediate recharge or battery replacement is required to maintain real-time telemetry.",
        device_id: "TRK-007",
        user_id: null,
        is_read: false,
        created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      },
      {
        id: "notif-geo-006",
        type: "geofence_alert",
        title: "Unauthorized Perimeter Breach",
        message: "Tracker TRK-006 has exited the designated 'Faridabad warehouse zone' boundary without an active dispatch permit. Latitude: 28.5672, Longitude: 77.3215.",
        device_id: "TRK-006",
        user_id: null,
        is_read: false,
        created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      },
      {
        id: "notif-stat-001",
        type: "status_change",
        title: "Dispatch Transit Initiated",
        message: "Tracker TRK-001 has transitioned from 'In Storage' to 'In Transit'. Current route: Delhi Main Warehouse → Noida Sector 62. Field engineer: Rajesh Kumar.",
        device_id: "TRK-001",
        user_id: null,
        is_read: false,
        created_at: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
      },
      {
        id: "notif-bat-004",
        type: "battery_alert",
        title: "Low Battery Warning (15%)",
        message: "Tracker TRK-004 has fallen below the 20% battery threshold. Current reading is 15%. Recommend scheduling servicing.",
        device_id: "TRK-004",
        user_id: null,
        is_read: true,
        created_at: new Date(Date.now() - 1000 * 3600 * 4).toISOString(),
      },
      {
        id: "notif-sys-101",
        type: "system",
        title: "Firmware v2.4.1 Rollout Complete",
        message: "Smart meter telemetry gateway successfully updated all field units to firmware version v2.4.1. GPS accuracy and power saving profiles are now active.",
        device_id: null,
        user_id: null,
        is_read: true,
        created_at: new Date(Date.now() - 1000 * 3600 * 18).toISOString(),
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

  // Initialize default user if empty
  if (!localStorage.getItem("smtrack_user")) {
    const defaultUser = {
      id: "usr-admin-01",
      email: "admin@smtrack.com",
      full_name: "Fleet Administrator",
      phone: "+91 98765 43210",
      password: "admin",
      avatar_url: null,
      role: "admin" as const,
      created_at: new Date().toISOString(),
    };
    localStorage.setItem("smtrack_user", JSON.stringify(defaultUser));
    const users = JSON.parse(localStorage.getItem("smtrack_users") || "[]");
    if (!users.some((u: any) => u.email === defaultUser.email)) {
      users.push(defaultUser);
      localStorage.setItem("smtrack_users", JSON.stringify(users));
    }
  }
};

