export type TrackerStatus = 'in_storage' | 'in_transit' | 'installed_off' | 'detached';

export interface Tracker {
  id: string;
  device_id: string;
  meter_id: string;
  latitude: number;
  longitude: number;
  battery_level: number;
  status: TrackerStatus;
  last_updated: string;
  assigned_to?: string | null;
  warehouse?: string | null;
  route?: string | null;
}

export interface Activity {
  id: string;
  type: 'location_update' | 'status_change' | 'battery_alert' | 'geofence_alert';
  device_id: string;
  message: string;
  timestamp: string;
}

export interface GeofenceZone {
  id: string;
  name: string;
  type: 'warehouse' | 'site' | 'restricted';
  lat: number;
  lng: number;
  radius: number;
  alert_type: 'entry' | 'exit' | 'both';
  tracker_count: number;
}

// All mock dummy data removed. Default arrays are empty.
export const mockTrackers: Tracker[] = [];
export const mockActivities: Activity[] = [];
export const mockGeofences: GeofenceZone[] = [];

export const statusConfig: Record<TrackerStatus, { label: string; dotClass: string; color: string }> = {
  in_storage: { label: 'In Storage', dotClass: 'status-dot-storage', color: 'info' },
  in_transit: { label: 'In Transit', dotClass: 'status-dot-transit', color: 'warning' },
  installed_off: { label: 'Installed', dotClass: 'status-dot-installed', color: 'success' },
  detached: { label: 'Detached', dotClass: 'status-dot-detached', color: 'destructive' },
};

// Analytics empty defaults
export const dailyUpdates: { date: string; updates: number; alerts: number }[] = [];
export const statusDistribution: { name: string; value: number; fill: string }[] = [];
export const batteryDistribution: { range: string; count: number }[] = [];
