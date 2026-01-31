import pino from 'pino'

const isDevelopment = process.env.NODE_ENV === 'development'

// Create logger instance
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: isDevelopment ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname',
    },
  } : undefined,
  base: {
    pid: process.pid,
    hostname: process.env.HOSTNAME || 'unknown',
    service: 'meter-gps-dashboard',
    version: process.env.npm_package_version || '1.0.0',
  },
})

// Structured logging helpers
export const logUserAction = (userId: string, action: string, metadata?: any) => {
  logger.info({
    event: 'user_action',
    userId,
    action,
    metadata,
    timestamp: new Date().toISOString(),
  })
}

export const logSystemEvent = (event: string, metadata?: any) => {
  logger.info({
    event: 'system_event',
    ...metadata,
    timestamp: new Date().toISOString(),
  })
}

export const logError = (error: Error, context?: any) => {
  logger.error({
    event: 'error',
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    context,
    timestamp: new Date().toISOString(),
  })
}

export const logTrackerUpdate = (deviceId: string, updateData: any) => {
  logger.info({
    event: 'tracker_update',
    deviceId,
    data: updateData,
    timestamp: new Date().toISOString(),
  })
}

export const logApiCall = (method: string, url: string, statusCode: number, duration: number, userId?: string) => {
  logger.info({
    event: 'api_call',
    method,
    url,
    statusCode,
    duration,
    userId,
    timestamp: new Date().toISOString(),
  })
}

export default logger
