import { apiClient, ApiResponse } from "./api.client";

export interface AnalyticsSummary {
  totalTrackers: number;
  activeTrackers: number;
  offlineTrackers: number;
  lowBatteryTrackers: number;
}

export const analyticsService = {
  getSummary: async (): Promise<AnalyticsSummary> => {
    try {
      const res = await apiClient.get<ApiResponse<AnalyticsSummary>>("/analytics/summary");
      return (
        res?.data || {
          totalTrackers: 0,
          activeTrackers: 0,
          offlineTrackers: 0,
          lowBatteryTrackers: 0,
        }
      );
    } catch {
      return {
        totalTrackers: 0,
        activeTrackers: 0,
        offlineTrackers: 0,
        lowBatteryTrackers: 0,
      };
    }
  },

  getTrackerHistory: async (trackerId: string, limit: number = 100) => {
    try {
      const res = await apiClient.get<ApiResponse<any[]>>(`/analytics/tracker/${trackerId}/history?limit=${limit}`);
      return res?.data || [];
    } catch {
      return [];
    }
  },

  getGeofenceBreaches: async () => {
    try {
      const res = await apiClient.get<ApiResponse<any[]>>("/analytics/geofence/breaches");
      return res?.data || [];
    } catch {
      return [];
    }
  },
};
