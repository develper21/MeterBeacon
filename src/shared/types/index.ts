export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AppRole = "admin" | "manager" | "field_engineer";
export type TrackerStatus = 'in_storage' | 'in_transit' | 'installed_off' | 'detached';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  password?: string;
  avatar_url: string | null;
  role: AppRole;
  created_at: string;
}

export interface Tracker {
  id: string;
  device_id: string;
  meter_id: string;
  latitude: number;
  longitude: number;
  battery_level: number;
  status: TrackerStatus;
  assigned_to: string | null;
  route: string | null;
  warehouse: string | null;
  created_at: string;
  last_updated: string;
}

export interface TrackerHistory {
  id: string;
  tracker_id: string;
  latitude: number;
  longitude: number;
  battery_level: number;
  status: string;
  recorded_at: string;
}

export interface Geofence {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius: number;
  type: string;
  alert_type: string;
  created_by: string | null;
  created_at: string;
  tracker_count?: number;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  device_id: string | null;
  user_id: string | null;
  is_read: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string | null;
  entity_type: string;
  entity_id: string | null;
  action: string;
  details: Json | null;
  created_at: string;
}
