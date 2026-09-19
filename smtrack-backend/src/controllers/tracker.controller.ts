import { Response } from 'express';
import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../types';

export const getTrackers = async (req: AuthRequest, res: Response) => {
  try {
    const trackers = await prisma.tracker.findMany({
      orderBy: { lastUpdate: 'desc' },
    });

    res.json({
      success: true,
      data: trackers,
    });
  } catch (error) {
    throw new AppError('Failed to fetch trackers', 500);
  }
};

export const getTrackerById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const tracker = await prisma.tracker.findUnique({
      where: { id },
      include: {
        history: {
          orderBy: { timestamp: 'desc' },
          take: 100,
        },
      },
    });

    if (!tracker) {
      throw new AppError('Tracker not found', 404);
    }

    res.json({
      success: true,
      data: tracker,
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to fetch tracker', 500);
  }
};

export const createTracker = async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;

    const tracker = await prisma.tracker.create({
      data,
    });

    res.status(201).json({
      success: true,
      message: 'Tracker created successfully',
      data: tracker,
    });
  } catch (error) {
    throw new AppError('Failed to create tracker', 500);
  }
};

export const updateTracker = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const tracker = await prisma.tracker.update({
      where: { id },
      data,
    });

    res.json({
      success: true,
      message: 'Tracker updated successfully',
      data: tracker,
    });
  } catch (error) {
    throw new AppError('Failed to update tracker', 500);
  }
};

export const deleteTracker = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.tracker.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Tracker deleted successfully',
    });
  } catch (error) {
    throw new AppError('Failed to delete tracker', 500);
  }
};

export const updateLocation = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { latitude, longitude, batteryLevel } = req.body;

    // Update tracker location
    const tracker = await prisma.tracker.update({
      where: { id },
      data: {
        latitude,
        longitude,
        batteryLevel: batteryLevel || undefined,
        lastUpdate: new Date(),
      },
    });

    // Add to history
    await prisma.trackerHistory.create({
      data: {
        trackerId: id,
        latitude,
        longitude,
        batteryLevel: batteryLevel || tracker.batteryLevel,
      },
    });

    res.json({
      success: true,
      message: 'Location updated successfully',
      data: tracker,
    });
  } catch (error) {
    throw new AppError('Failed to update location', 500);
  }
};
