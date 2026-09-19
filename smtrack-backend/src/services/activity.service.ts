import prisma from '../lib/prisma';
import { logger } from '../utils/logger';

export const logActivity = async (data: {
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: any;
}) => {
  try {
    const activity = await prisma.activityLog.create({
      data: {
        ...data,
        details: data.details || {},
      },
    });

    logger.info(`Activity logged: ${data.action} on ${data.entityType}:${data.entityId}`);

    return activity;
  } catch (error) {
    logger.error('Failed to log activity', error);
    throw error;
  }
};
