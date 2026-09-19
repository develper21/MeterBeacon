import prisma from '../lib/prisma';
import { logger } from '../utils/logger';

export const checkPointInPolygon = async (
  geofenceId: string,
  latitude: number,
  longitude: number
): Promise<boolean> => {
  try {
    const geofence = await prisma.geofence.findUnique({
      where: { id: geofenceId },
    });

    if (!geofence) {
      throw new Error('Geofence not found');
    }

    // Parse GeoJSON polygon
    const polygon = JSON.parse(geofence.area);

    // Simple point-in-polygon algorithm (ray casting)
    // For production, use PostGIS: ST_Contains(ST_GeomFromGeoJSON(area), ST_MakePoint(longitude, latitude))
    const isInside = isPointInPolygon([longitude, latitude], polygon.coordinates[0]);

    return isInside;
  } catch (error) {
    logger.error('Failed to check point in polygon', error);
    throw error;
  }
};

// Ray casting algorithm for point-in-polygon check
const isPointInPolygon = (point: [number, number], polygon: [number, number][]): boolean => {
  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];

    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
};

export const createGeofenceGeoJSON = (
  name: string,
  type: string,
  coordinates: number[][]
): string => {
  return JSON.stringify({
    type: 'Polygon',
    coordinates: [coordinates],
  });
};

export const parseGeofenceArea = (area: string): any => {
  try {
    return JSON.parse(area);
  } catch (error) {
    logger.error('Failed to parse geofence area', error);
    throw new Error('Invalid GeoJSON format');
  }
};

// PostGIS-based implementation (to be used when PostGIS is available)
export const checkPointInPolygonPostGIS = async (
  geofenceId: string,
  latitude: number,
  longitude: number
): Promise<boolean> => {
  try {
    // This would use raw SQL with PostGIS functions
    // Example: SELECT ST_Contains(ST_GeomFromGeoJSON(area), ST_MakePoint($2, $1)) FROM geofences WHERE id = $3
    const result = await prisma.$queryRaw`
      SELECT ST_Contains(
        ST_GeomFromGeoJSON(area),
        ST_MakePoint(${longitude}, ${latitude})
      ) as inside
      FROM geofences
      WHERE id = ${geofenceId}
    `;

    return (result as any)[0]?.inside || false;
  } catch (error) {
    logger.error('Failed to check point in polygon with PostGIS', error);
    // Fallback to JavaScript implementation
    return checkPointInPolygon(geofenceId, latitude, longitude);
  }
};

export const findGeofencesContainingPoint = async (
  latitude: number,
  longitude: number
): Promise<any[]> => {
  try {
    const geofences = await prisma.geofence.findMany();

    const containingGeofences = [];

    for (const geofence of geofences) {
      const isInside = await checkPointInPolygon(geofence.id, latitude, longitude);
      if (isInside) {
        containingGeofences.push(geofence);
      }
    }

    return containingGeofences;
  } catch (error) {
    logger.error('Failed to find geofences containing point', error);
    throw error;
  }
};

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance; // Distance in km
};
