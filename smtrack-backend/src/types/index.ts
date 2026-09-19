import { Request } from 'express';

export interface User {
  id: string;
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  role: 'admin' | 'manager' | 'field_engineer';
  created_at: Date;
  updated_at: Date;
}

export interface Tracker {
  id: string;
  device_id: string;
  meter_id: string;
  name: string;
  status: 'active' | 'inactive' | 'maintenance' | 'offline';
  battery_level: number;
  latitude: number;
  longitude: number;
  last_update: Date;
  created_at: Date;
  updated_at: Date;
}

export interface TrackerHistory {
  id: string;
  tracker_id: string;
  latitude: number;
  longitude: number;
  battery_level: number;
  timestamp: Date;
}

export interface Geofence {
  id: string;
  name: string;
  type: 'warehouse' | 'site' | 'restricted';
  area: string; // GeoJSON polygon
  created_at: Date;
  updated_at: Date;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'geofence_breach' | 'low_battery' | 'tracker_offline' | 'system';
  title: string;
  message: string;
  tracker_id?: string;
  is_read: boolean;
  created_at: Date;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: any;
  created_at: Date;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}
