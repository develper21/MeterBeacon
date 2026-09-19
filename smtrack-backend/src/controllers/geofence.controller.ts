import { Response } from 'express';
import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../types';
import {
  checkPointInPolygon,
  findGeofencesContainingPoint,
  calculateDistance,
} from '../services/geofence.service';

export const getGeofences = async (req: AuthRequest, res: Response) => {
  try {
    const geofences = await prisma.geofence.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: geofences,
    });
  } catch (error) {
    throw new AppError('Failed to fetch geofences', 500);
  }
};

export const createGeofence = async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;

    const geofence = await prisma.geofence.create({
      data,
    });

    res.status(201).json({
      success: true,
      message: 'Geofence created successfully',
      data: geofence,
    });
  } catch (error) {
    throw new AppError('Failed to create geofence', 500);
  }
};

export const updateGeofence = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const geofence = await prisma.geofence.update({
      where: { id },
      data,
    });

    res.json({
      success: true,
      message: 'Geofence updated successfully',
      data: geofence,
    });
  } catch (error) {
    throw new AppError('Failed to update geofence', 500);
  }
};

export const deleteGeofence = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.geofence.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Geofence deleted successfully',
    });
  } catch (error) {
    throw new AppError('Failed to delete geofence', 500);
  }
};

export const checkGeofence = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      throw new AppError('Latitude and longitude are required', 400);
    }

    const lat = parseFloat(latitude as string);
    const lon = parseFloat(longitude as string);

    const isInside = await checkPointInPolygon(id, lat, lon);

    res.json({
      success: true,
      data: {
        inside: isInside,
        geofenceId: id,
        point: { latitude: lat, longitude: lon },
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to check geofence', 500);
  }
};

export const findContainingGeofences = async (req: AuthRequest, res: Response) => {
  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      throw new AppError('Latitude and longitude are required', 400);
    }

    const lat = parseFloat(latitude as string);
    const lon = parseFloat(longitude as string);

    const geofences = await findGeofencesContainingPoint(lat, lon);

    res.json({
      success: true,
      data: geofences,
      count: geofences.length,
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to find containing geofences', 500);
  }
};

export const calculateDistanceToPoint = async (req: AuthRequest, res: Response) => {
  try {
    const { lat1, lon1, lat2, lon2 } = req.query;

    if (!lat1 || !lon1 || !lat2 || !lon2) {
      throw new AppError('All coordinates are required', 400);
    }

    const distance = calculateDistance(
      parseFloat(lat1 as string),
      parseFloat(lon1 as string),
      parseFloat(lat2 as string),
      parseFloat(lon2 as string)
    );

    res.json({
      success: true,
      data: {
        distance: distance,
        unit: 'km',
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to calculate distance', 500);
  }
};
