import { Server as SocketIOServer } from 'socket.io';
import { logger } from '../utils/logger';

export function setupSocket(io: SocketIOServer) {
  io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    socket.on('join_tracker_room', (trackerId: string) => {
      socket.join(`tracker:${trackerId}`);
      logger.info(`Socket ${socket.id} joined tracker room: ${trackerId}`);
    });

    socket.on('leave_tracker_room', (trackerId: string) => {
      socket.leave(`tracker:${trackerId}`);
      logger.info(`Socket ${socket.id} left tracker room: ${trackerId}`);
    });

    socket.on('gps_update', (data: any) => {
      logger.info(`GPS update received: ${JSON.stringify(data)}`);
      // Broadcast to all clients in the tracker room
      io.to(`tracker:${data.trackerId}`).emit('tracker_location_update', data);
    });

    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });
}
