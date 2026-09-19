import { createClient } from 'redis';
import { config } from '../config';
import { logger } from '../utils/logger';

let redisClient: ReturnType<typeof createClient> | null = null;
let isConnected = false;

export const connectRedis = async () => {
  try {
    // Only connect if REDIS_URL is configured
    if (!config.redisUrl || config.redisUrl === 'redis://localhost:6379') {
      logger.warn('Redis URL not configured or using localhost. Skipping Redis connection.');
      return;
    }

    redisClient = createClient({
      url: config.redisUrl,
    });

    redisClient.on('error', (err) => {
      logger.error('Redis Client Error', err);
      isConnected = false;
    });

    redisClient.on('connect', () => {
      logger.info('Redis Client Connected');
      isConnected = true;
    });

    await redisClient.connect();
  } catch (error) {
    logger.error('Failed to connect to Redis', error);
    redisClient = null;
    isConnected = false;
  }
};

export const getRedis = () => redisClient;

export const isRedisConnected = () => isConnected;

export const setCache = async (key: string, value: any, ttl?: number) => {
  if (!redisClient || !isConnected) {
    logger.warn('Redis not connected, skipping cache set');
    return;
  }
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
  if (!redisClient || !isConnected) {
    logger.warn('Redis not connected, skipping cache get');
    return null;
  }
  try {
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    logger.error('Failed to get cache', error);
    return null;
  }
};

export const deleteCache = async (key: string) => {
  if (!redisClient || !isConnected) {
    logger.warn('Redis not connected, skipping cache delete');
    return;
  }
  try {
    await redisClient.del(key);
  } catch (error) {
    logger.error('Failed to delete cache', error);
  }
};

export const publishMessage = async (channel: string, message: any) => {
  if (!redisClient || !isConnected) {
    logger.warn('Redis not connected, skipping message publish');
    return;
  }
  try {
    await redisClient.publish(channel, JSON.stringify(message));
  } catch (error) {
    logger.error('Failed to publish message', error);
  }
};

export const subscribeToChannel = async (channel: string, callback: (message: any) => void) => {
  if (!redisClient || !isConnected) {
    logger.warn('Redis not connected, skipping channel subscription');
    return null;
  }
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
