import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimit';
import { logger } from './utils/logger';
import { connectRedis } from './services/redis.service';
import { setupSocket } from './socket';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import trackerRoutes from './routes/tracker.routes';
import geofenceRoutes from './routes/geofence.routes';
import notificationRoutes from './routes/notification.routes';
import analyticsRoutes from './routes/analytics.routes';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    if (
      origin === config.frontendUrl ||
      /^http:\/\/localhost(:\d+)?$/.test(origin) ||
      /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)
    ) {
      return callback(null, true);
    }
    callback(null, true); // Permissive in dev
  },
  credentials: true,
};

const io = new SocketIOServer(httpServer, {
  cors: corsOptions,
});

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter);

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Swagger API Documentation (TODO: Setup swagger)
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// app.get('/api-docs.json', (req, res) => {
//   res.json(swaggerSpec);
// });

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/trackers', trackerRoutes);
app.use('/api/geofences', geofenceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);

// Socket.io setup
setupSocket(io);

// Error handling
app.use(errorHandler);

// Start server
const PORT = config.port;

// Connect to Redis
connectRedis();

httpServer.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${config.nodeEnv}`);
  logger.info(`Frontend URL: ${config.frontendUrl}`);
});

export { app, io };
