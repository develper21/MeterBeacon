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
  assigned_to?: string;
  warehouse?: string;
  route?: string;
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

export const mockTrackers: Tracker[] = [
  { id: '1', device_id: 'TRK-001', meter_id: 'MTR-10234', latitude: 28.6139, longitude: 77.2090, battery_level: 92, status: 'in_transit', last_updated: '2026-02-15T10:30:00Z', assigned_to: 'Rajesh Kumar', route: 'Delhi → Noida' },
  { id: '2', device_id: 'TRK-002', meter_id: 'MTR-10235', latitude: 28.5355, longitude: 77.3910, battery_level: 78, status: 'in_transit', last_updated: '2026-02-15T10:28:00Z', assigned_to: 'Amit Sharma', route: 'Noida → Greater Noida' },
  { id: '3', device_id: 'TRK-003', meter_id: 'MTR-10236', latitude: 28.4595, longitude: 77.0266, battery_level: 45, status: 'in_storage', last_updated: '2026-02-15T09:15:00Z', warehouse: 'Gurgaon Central WH' },
  { id: '4', device_id: 'TRK-004', meter_id: 'MTR-10237', latitude: 28.7041, longitude: 77.1025, battery_level: 15, status: 'installed_off', last_updated: '2026-02-15T08:00:00Z', assigned_to: 'Priya Singh' },
  { id: '5', device_id: 'TRK-005', meter_id: 'MTR-10238', latitude: 28.6304, longitude: 77.2177, battery_level: 88, status: 'in_storage', last_updated: '2026-02-15T10:25:00Z', warehouse: 'Delhi Main WH' },
  { id: '6', device_id: 'TRK-006', meter_id: 'MTR-10239', latitude: 28.5672, longitude: 77.3215, battery_level: 62, status: 'in_transit', last_updated: '2026-02-15T10:20:00Z', assigned_to: 'Vikram Patel', route: 'Faridabad → Mathura' },
  { id: '7', device_id: 'TRK-007', meter_id: 'MTR-10240', latitude: 28.4089, longitude: 77.3178, battery_level: 8, status: 'detached', last_updated: '2026-02-14T22:00:00Z' },
  { id: '8', device_id: 'TRK-008', meter_id: 'MTR-10241', latitude: 28.6892, longitude: 77.1510, battery_level: 95, status: 'installed_off', last_updated: '2026-02-15T10:32:00Z', assigned_to: 'Neha Gupta' },
  { id: '9', device_id: 'TRK-009', meter_id: 'MTR-10242', latitude: 28.5244, longitude: 77.1855, battery_level: 71, status: 'in_transit', last_updated: '2026-02-15T10:18:00Z', assigned_to: 'Suresh Yadav', route: 'Delhi → Ghaziabad' },
  { id: '10', device_id: 'TRK-010', meter_id: 'MTR-10243', latitude: 28.6448, longitude: 77.0832, battery_level: 33, status: 'in_storage', last_updated: '2026-02-15T07:45:00Z', warehouse: 'West Delhi WH' },
  { id: '11', device_id: 'TRK-011', meter_id: 'MTR-10244', latitude: 28.7500, longitude: 77.1171, battery_level: 55, status: 'in_transit', last_updated: '2026-02-15T10:10:00Z', assigned_to: 'Rahul Mehta', route: 'Delhi → Sonipat' },
  { id: '12', device_id: 'TRK-012', meter_id: 'MTR-10245', latitude: 28.4900, longitude: 77.0800, battery_level: 82, status: 'installed_off', last_updated: '2026-02-15T09:50:00Z', assigned_to: 'Anita Desai' },
];

export const mockActivities: Activity[] = [
  { id: '1', type: 'status_change', device_id: 'TRK-001', message: 'Status changed to in_transit', timestamp: '2026-02-15T10:30:00Z' },
  { id: '2', type: 'battery_alert', device_id: 'TRK-007', message: 'Critical battery level: 8%', timestamp: '2026-02-15T10:28:00Z' },
  { id: '3', type: 'geofence_alert', device_id: 'TRK-006', message: 'Exited Faridabad warehouse zone', timestamp: '2026-02-15T10:20:00Z' },
  { id: '4', type: 'location_update', device_id: 'TRK-002', message: 'Location updated: Noida Sector 62', timestamp: '2026-02-15T10:18:00Z' },
  { id: '5', type: 'battery_alert', device_id: 'TRK-004', message: 'Low battery level: 15%', timestamp: '2026-02-15T10:15:00Z' },
  { id: '6', type: 'status_change', device_id: 'TRK-008', message: 'Meter commissioned successfully', timestamp: '2026-02-15T10:10:00Z' },
  { id: '7', type: 'location_update', device_id: 'TRK-011', message: 'Moving on NH-44 towards Sonipat', timestamp: '2026-02-15T10:05:00Z' },
  { id: '8', type: 'geofence_alert', device_id: 'TRK-003', message: 'Entered Gurgaon Central WH', timestamp: '2026-02-15T09:15:00Z' },
];

export const mockGeofences: GeofenceZone[] = [
  { id: '1', name: 'Delhi Main Warehouse', type: 'warehouse', lat: 28.6304, lng: 77.2177, radius: 500, alert_type: 'both', tracker_count: 3 },
  { id: '2', name: 'Gurgaon Central WH', type: 'warehouse', lat: 28.4595, lng: 77.0266, radius: 400, alert_type: 'both', tracker_count: 2 },
  { id: '3', name: 'Noida Installation Site', type: 'site', lat: 28.5355, lng: 77.3910, radius: 300, alert_type: 'entry', tracker_count: 1 },
  { id: '4', name: 'Restricted Zone A', type: 'restricted', lat: 28.7041, lng: 77.1025, radius: 200, alert_type: 'exit', tracker_count: 0 },
  { id: '5', name: 'West Delhi WH', type: 'warehouse', lat: 28.6448, lng: 77.0832, radius: 350, alert_type: 'both', tracker_count: 1 },
];

export const statusConfig: Record<TrackerStatus, { label: string; dotClass: string; color: string }> = {
  in_storage: { label: 'In Storage', dotClass: 'status-dot-storage', color: 'info' },
  in_transit: { label: 'In Transit', dotClass: 'status-dot-transit', color: 'warning' },
  installed_off: { label: 'Installed', dotClass: 'status-dot-installed', color: 'success' },
  detached: { label: 'Detached', dotClass: 'status-dot-detached', color: 'destructive' },
};

// Analytics data
export const dailyUpdates = [
  { date: 'Feb 9', updates: 1240, alerts: 12 },
  { date: 'Feb 10', updates: 1380, alerts: 8 },
  { date: 'Feb 11', updates: 1100, alerts: 15 },
  { date: 'Feb 12', updates: 1520, alerts: 6 },
  { date: 'Feb 13', updates: 1450, alerts: 10 },
  { date: 'Feb 14', updates: 1300, alerts: 18 },
  { date: 'Feb 15', updates: 890, alerts: 5 },
];

export const statusDistribution = [
  { name: 'In Storage', value: 3, fill: 'hsl(200, 80%, 55%)' },
  { name: 'In Transit', value: 5, fill: 'hsl(38, 92%, 55%)' },
  { name: 'Installed', value: 3, fill: 'hsl(150, 60%, 45%)' },
  { name: 'Detached', value: 1, fill: 'hsl(0, 72%, 55%)' },
];

export const batteryDistribution = [
  { range: '0-20%', count: 2 },
  { range: '21-40%', count: 1 },
  { range: '41-60%', count: 2 },
  { range: '61-80%', count: 3 },
  { range: '81-100%', count: 4 },
];
