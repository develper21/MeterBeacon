import { Response } from 'express';
import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../types';

export const getSummary = async (req: AuthRequest, res: Response) => {
  try {
    const [totalTrackers, activeTrackers, offlineTrackers, lowBatteryTrackers] = await Promise.all([
      prisma.tracker.count(),
      prisma.tracker.count({ where: { status: 'ACTIVE' } }),
      prisma.tracker.count({ where: { status: 'OFFLINE' } }),
      prisma.tracker.count({ where: { batteryLevel: { lt: 20 } } }),
    ]);

    res.json({
      success: true,
      data: {
        totalTrackers,
        activeTrackers,
        offlineTrackers,
        lowBatteryTrackers,
      },
    });
  } catch (error) {
    throw new AppError('Failed to fetch analytics summary', 500);
  }
};

export const getTrackerHistory = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { limit = 100 } = req.query;

    const history = await prisma.trackerHistory.findMany({
      where: { trackerId: id },
      orderBy: { timestamp: 'desc' },
      take: Number(limit),
    });

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    throw new AppError('Failed to fetch tracker history', 500);
  }
};

export const getGeofenceBreaches = async (req: AuthRequest, res: Response) => {
  try {
    // TODO: Implement PostGIS query to find geofence breaches
    // For now, return placeholder
    res.json({
      success: true,
      data: [],
      message: 'Geofence breach tracking not yet implemented',
    });
  } catch (error) {
    throw new AppError('Failed to fetch geofence breaches', 500);
  }
};
