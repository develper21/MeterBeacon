import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Smart Meter GPS Tracking API',
      version: '1.0.0',
      description: 'API for Smart Meter GPS Tracking System with real-time location tracking and geofencing',
      contact: {
        name: 'API Support',
        email: 'support@smtrack.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
      {
        url: 'https://api.smtrack.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            fullName: { type: 'string' },
            phone: { type: 'string' },
            role: {
              type: 'string',
              enum: ['ADMIN', 'MANAGER', 'FIELD_ENGINEER'],
            },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Tracker: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            deviceId: { type: 'string' },
            meterId: { type: 'string' },
            name: { type: 'string' },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'OFFLINE'],
            },
            batteryLevel: { type: 'number' },
            latitude: { type: 'number' },
            longitude: { type: 'number' },
            lastUpdate: { type: 'string', format: 'date-time' },
          },
        },
        Geofence: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            type: {
              type: 'string',
              enum: ['WAREHOUSE', 'SITE', 'RESTRICTED'],
            },
            area: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Notification: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            type: {
              type: 'string',
              enum: ['GEOFENCE_BREACH', 'LOW_BATTERY', 'TRACKER_OFFLINE', 'SYSTEM'],
            },
            title: { type: 'string' },
            message: { type: 'string' },
            trackerId: { type: 'string' },
            isRead: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
