import { storage } from "@/shared/services/storage.service";
import type { Geofence } from "@/shared/types";

export const geofenceService = {
  getGeofences: (): Geofence[] => storage.getGeofences(),
  
  setGeofences: (geofences: Geofence[]) => storage.setGeofences(geofences),
  
  addGeofence: (geofence: Geofence) => storage.addGeofence(geofence),
  
  updateGeofence: (id: string, updates: Partial<Geofence>) => storage.updateGeofence(id, updates),
  
  deleteGeofence: (id: string) => storage.deleteGeofence(id),
};
