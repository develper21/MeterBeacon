import { z } from 'zod';

export const createGeofenceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['WAREHOUSE', 'SITE', 'RESTRICTED']),
  area: z.string().min(1, 'Area (GeoJSON) is required'),
});

export const updateGeofenceSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(['WAREHOUSE', 'SITE', 'RESTRICTED']).optional(),
  area: z.string().min(1).optional(),
});

export type CreateGeofenceInput = z.infer<typeof createGeofenceSchema>;
export type UpdateGeofenceInput = z.infer<typeof updateGeofenceSchema>;
