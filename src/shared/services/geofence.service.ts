import { apiClient, ApiResponse } from "./api.client";
import type { Geofence } from "@/shared/types";

export const normalizeGeofence = (raw: any): Geofence => {
  if (!raw) return raw;

  let lat = 28.6139;
  let lng = 77.2090;
  let radius = 500;
  let alertType = "both";

  if (raw.area) {
    try {
      const parsed = typeof raw.area === "string" ? JSON.parse(raw.area) : raw.area;
      if (parsed.coordinates && Array.isArray(parsed.coordinates)) {
        if (parsed.type === "Circle") {
          lng = parsed.coordinates[0];
          lat = parsed.coordinates[1];
          if (parsed.radius) radius = parsed.radius;
          if (parsed.alert_type) alertType = parsed.alert_type;
        } else if (parsed.type === "Polygon" && parsed.coordinates[0]?.[0]) {
          // Polygon centroid approximation
          const ring = parsed.coordinates[0];
          let sumLat = 0;
          let sumLng = 0;
          for (const pt of ring) {
            sumLng += pt[0];
            sumLat += pt[1];
          }
          lng = sumLng / ring.length;
          lat = sumLat / ring.length;
          radius = parsed.radius || 450;
        }
      }
    } catch {
      // Keep default lat/lng
    }
  }

  if (typeof raw.lat === "number") lat = raw.lat;
  if (typeof raw.lng === "number") lng = raw.lng;
  if (typeof raw.radius === "number") radius = raw.radius;
  if (raw.alert_type) alertType = raw.alert_type;

  const type = (raw.type || "WAREHOUSE").toLowerCase();

  return {
    id: raw.id,
    name: raw.name,
    type: type,
    lat,
    lng,
    radius,
    alert_type: alertType,
    created_by: raw.created_by || null,
    created_at: raw.createdAt || raw.created_at || new Date().toISOString(),
    tracker_count: raw.tracker_count ?? 0,
  };
};

export const geofenceService = {
  getGeofences: async (): Promise<Geofence[]> => {
    const res = await apiClient.get<ApiResponse<any[]>>("/geofences");
    const list = res?.data || [];
    return list.map(normalizeGeofence);
  },

  getGeofenceById: async (id: string): Promise<Geofence | null> => {
    try {
      // Check from list
      const list = await geofenceService.getGeofences();
      return list.find((g) => g.id === id) || null;
    } catch {
      return null;
    }
  },

  createGeofence: async (data: {
    name: string;
    type: "warehouse" | "site" | "restricted" | string;
    lat: number;
    lng: number;
    radius: number;
    alert_type?: "entry" | "exit" | "both" | string;
  }): Promise<Geofence> => {
    const backendType = data.type.toUpperCase() as "WAREHOUSE" | "SITE" | "RESTRICTED";
    const areaJson = JSON.stringify({
      type: "Circle",
      coordinates: [data.lng, data.lat],
      radius: data.radius,
      alert_type: data.alert_type || "both",
    });

    const res = await apiClient.post<ApiResponse<any>>("/geofences", {
      name: data.name,
      type: backendType,
      area: areaJson,
    });
    return normalizeGeofence(res.data);
  },

  updateGeofence: async (
    id: string,
    updates: Partial<Geofence>
  ): Promise<Geofence> => {
    const payload: any = {};
    if (updates.name) payload.name = updates.name;
    if (updates.type) payload.type = updates.type.toUpperCase();

    if (
      typeof updates.lat === "number" ||
      typeof updates.lng === "number" ||
      typeof updates.radius === "number" ||
      updates.alert_type
    ) {
      payload.area = JSON.stringify({
        type: "Circle",
        coordinates: [updates.lng, updates.lat],
        radius: updates.radius,
        alert_type: updates.alert_type || "both",
      });
    }

    const res = await apiClient.put<ApiResponse<any>>(`/geofences/${id}`, payload);
    return normalizeGeofence(res.data);
  },

  deleteGeofence: async (id: string): Promise<boolean> => {
    await apiClient.delete(`/geofences/${id}`);
    return true;
  },

  checkPointInside: async (
    id: string,
    latitude: number,
    longitude: number
  ): Promise<boolean> => {
    try {
      const res = await apiClient.get<ApiResponse<{ inside: boolean }>>(
        `/geofences/${id}/check?latitude=${latitude}&longitude=${longitude}`
      );
      return Boolean(res?.data?.inside);
    } catch {
      return false;
    }
  },
};
