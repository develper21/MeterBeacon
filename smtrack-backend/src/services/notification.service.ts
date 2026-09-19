import prisma from '../lib/prisma';
import { logger } from '../utils/logger';

export const createNotification = async (data: {
  userId: string;
  type: string;
  title: string;
  message: string;
  trackerId?: string;
}) => {
  try {
    const notification = await prisma.notification.create({
      data,
    });

    logger.info(`Notification created for user ${data.userId}: ${data.title}`);

    return notification;
  } catch (error) {
    logger.error('Failed to create notification', error);
    throw error;
  }
};

export const createGeofenceBreachNotification = async (
  userId: string,
  trackerId: string,
  trackerName: string
) => {
  return createNotification({
    userId,
    type: 'GEOFENCE_BREACH',
    title: 'Geofence Breach Alert',
    message: `Tracker ${trackerName} has exited its designated geofence zone`,
    trackerId,
  });
};

export const createLowBatteryNotification = async (
  userId: string,
  trackerId: string,
  trackerName: string,
  batteryLevel: number
) => {
  return createNotification({
    userId,
    type: 'LOW_BATTERY',
    title: 'Low Battery Warning',
    message: `Tracker ${trackerName} battery is critically low (${batteryLevel}%)`,
    trackerId,
  });
};
