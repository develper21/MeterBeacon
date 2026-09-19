import { z } from 'zod';

export const createTrackerSchema = z.object({
  deviceId: z.string().min(1, 'Device ID is required'),
  meterId: z.string().min(1, 'Meter ID is required'),
  name: z.string().min(1, 'Name is required'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'OFFLINE']).optional(),
  batteryLevel: z.number().min(0).max(100).optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const updateTrackerSchema = z.object({
  name: z.string().min(1).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'OFFLINE']).optional(),
  batteryLevel: z.number().min(0).max(100).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const updateLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  batteryLevel: z.number().min(0).max(100).optional(),
});

export type CreateTrackerInput = z.infer<typeof createTrackerSchema>;
export type UpdateTrackerInput = z.infer<typeof updateTrackerSchema>;
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;
