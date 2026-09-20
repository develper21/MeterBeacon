import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Production vs Development environment separation
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  const envProdPath = path.resolve(process.cwd(), '.env.production');
  if (fs.existsSync(envProdPath)) {
    dotenv.config({ path: envProdPath });
  } else {
    dotenv.config();
  }
} else {
  const envLocalPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envLocalPath)) {
    dotenv.config({ path: envLocalPath });
  } else {
    dotenv.config();
  }
}

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  redisUrl: process.env.REDIS_URL || '',
  jwtSecret: (process.env.JWT_SECRET || '') as string,
  jwtRefreshSecret: (process.env.JWT_REFRESH_SECRET || '') as string,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
};
