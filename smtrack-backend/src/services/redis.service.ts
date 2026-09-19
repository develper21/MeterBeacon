import { createClient } from 'redis';
import { config } from '../config';
import { logger } from '../utils/logger';

const redisClient = createClient({
  url: config.redisUrl,
});

redisClient.on('error', (err) => {
  logger.error('Redis Client Error', err);
});

redisClient.on('connect', () => {
  logger.info('Redis Client Connected');
});

export const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    logger.error('Failed to connect to Redis', error);
  }
};

export const getRedis = () => redisClient;

export const setCache = async (key: string, value: any, ttl?: number) => {
  try {
    const stringValue = JSON.stringify(value);
    if (ttl) {
      await redisClient.setEx(key, ttl, stringValue);
    } else {
      await redisClient.set(key, stringValue);
    }
  } catch (error) {
    logger.error('Failed to set cache', error);
  }
};

export const getCache = async (key: string) => {
  try {
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    logger.error('Failed to get cache', error);
    return null;
  }
};

export const deleteCache = async (key: string) => {
  try {
    await redisClient.del(key);
  } catch (error) {
    logger.error('Failed to delete cache', error);
  }
};

export const publishMessage = async (channel: string, message: any) => {
  try {
    await redisClient.publish(channel, JSON.stringify(message));
  } catch (error) {
    logger.error('Failed to publish message', error);
  }
};

export const subscribeToChannel = async (channel: string, callback: (message: any) => void) => {
  try {
    const subscriber = redisClient.duplicate();
    await subscriber.connect();
    await subscriber.subscribe(channel, (message) => {
      try {
        callback(JSON.parse(message));
      } catch (error) {
        logger.error('Failed to parse message', error);
      }
    });
    return subscriber;
  } catch (error) {
    logger.error('Failed to subscribe to channel', error);
    throw error;
  }
};
