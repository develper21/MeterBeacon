import { apiClient, ApiResponse } from "./api.client";
import type { Tracker, TrackerHistory, TrackerStatus } from "@/shared/types";

// Helper to normalize status between backend enum and frontend UI strings
export const normalizeStatus = (status: string): TrackerStatus => {
  const s = (status || "").toLowerCase();
  if (s === "in_transit" || s === "active") return "in_transit";
  if (s === "in_storage" || s === "inactive") return "in_storage";
  if (s === "installed_off" || s === "offline") return "installed_off";
  if (s === "detached" || s === "maintenance") return "detached";
  return (status as TrackerStatus) || "in_storage";
};

export const toBackendStatus = (status: TrackerStatus | string): "ACTIVE" | "INACTIVE" | "MAINTENANCE" | "OFFLINE" => {
  const s = (status || "").toLowerCase();
  if (s === "in_transit" || s === "active") return "ACTIVE";
  if (s === "in_storage" || s === "inactive") return "INACTIVE";
  if (s === "installed_off" || s === "offline") return "OFFLINE";
  if (s === "detached" || s === "maintenance") return "MAINTENANCE";
  return "ACTIVE";
};

export const normalizeTracker = (raw: any): Tracker => {
  if (!raw) return raw;
  const status = normalizeStatus(raw.status);
  const deviceId = raw.device_id || raw.deviceId || "";
  const meterId = raw.meter_id || raw.meterId || "";
  const battery = typeof raw.battery_level === "number" ? raw.battery_level : (typeof raw.batteryLevel === "number" ? raw.batteryLevel : 100);
  const lat = typeof raw.latitude === "number" ? raw.latitude : 0;
  const lng = typeof raw.longitude === "number" ? raw.longitude : 0;
  const lastUpdated = raw.last_updated || raw.lastUpdate || raw.updatedAt || raw.createdAt || new Date().toISOString();
  const createdAt = raw.created_at || raw.createdAt || new Date().toISOString();

  return {
    id: raw.id,
    device_id: deviceId,
    deviceId: deviceId,
    meter_id: meterId,
    meterId: meterId,
    name: raw.name || deviceId,
    latitude: lat,
    longitude: lng,
    battery_level: battery,
    batteryLevel: battery,
    status: status,
    assigned_to: raw.assigned_to || raw.assignedTo || null,
    route: raw.route || null,
    warehouse: raw.warehouse || null,
    created_at: createdAt,
    last_updated: lastUpdated,
    lastUpdate: lastUpdated,
    history: raw.history || [],
  } as unknown as Tracker;
};

export const trackerService = {
  getTrackers: async (): Promise<Tracker[]> => {
    const res = await apiClient.get<ApiResponse<any[]>>("/trackers");
    const list = res?.data || [];
    return list.map(normalizeTracker);
  },

  getTrackerById: async (id: string): Promise<Tracker | null> => {
    try {
      const res = await apiClient.get<ApiResponse<any>>(`/trackers/${id}`);
      if (!res?.data) return null;
      return normalizeTracker(res.data);
    } catch (err) {
      // Return null if not found
      return null;
    }
  },

  createTracker: async (trackerData: {
    deviceId: string;
    meterId: string;
    name?: string;
    status?: TrackerStatus | string;
    batteryLevel?: number;
    latitude: number;
    longitude: number;
    assignedTo?: string;
    route?: string;
    warehouse?: string;
  }): Promise<Tracker> => {
    const payload = {
      deviceId: trackerData.deviceId,
      meterId: trackerData.meterId,
      name: trackerData.name || trackerData.deviceId,
      status: toBackendStatus(trackerData.status || "ACTIVE"),
      batteryLevel: trackerData.batteryLevel ?? 100,
      latitude: trackerData.latitude,
      longitude: trackerData.longitude,
    };
    const res = await apiClient.post<ApiResponse<any>>("/trackers", payload);
    return normalizeTracker(res.data);
  },

  updateTracker: async (
    id: string,
    updates: Partial<Tracker> & { name?: string; status?: TrackerStatus | string }
  ): Promise<Tracker> => {
    const payload: any = {};
    if (updates.name) payload.name = updates.name;
    if (updates.status) payload.status = toBackendStatus(updates.status);
    if (typeof updates.battery_level === "number") payload.batteryLevel = updates.battery_level;
    if (typeof updates.latitude === "number") payload.latitude = updates.latitude;
    if (typeof updates.longitude === "number") payload.longitude = updates.longitude;

    const res = await apiClient.put<ApiResponse<any>>(`/trackers/${id}`, payload);
    return normalizeTracker(res.data);
  },

  deleteTracker: async (id: string): Promise<boolean> => {
    await apiClient.delete(`/trackers/${id}`);
    return true;
  },

  updateLocation: async (
    id: string,
    latitude: number,
    longitude: number,
    batteryLevel?: number
  ): Promise<Tracker> => {
    const res = await apiClient.post<ApiResponse<any>>(`/trackers/${id}/location`, {
      latitude,
      longitude,
      batteryLevel,
    });
    return normalizeTracker(res.data);
  },

  getTrackerHistory: async (trackerId: string, limit: number = 100): Promise<TrackerHistory[]> => {
    try {
      const res = await apiClient.get<ApiResponse<any[]>>(`/analytics/tracker/${trackerId}/history?limit=${limit}`);
      return (res?.data || []).map((h: any) => ({
        id: h.id,
        tracker_id: h.trackerId || h.tracker_id,
        latitude: h.latitude,
        longitude: h.longitude,
        battery_level: h.batteryLevel ?? h.battery_level ?? 100,
        status: h.status || "in_transit",
        recorded_at: h.timestamp || h.recorded_at || new Date().toISOString(),
      }));
    } catch {
      return [];
    }
  },
};
