const { Server } = require('socket.io');
const { verifyAccessToken } = require('../utils/jwt');
const { userSessionCache, driverGeoIndex } = require('../utils/dataStructures');
const logger = require('../utils/logger');

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // ============================================================
  // AUTHENTICATION MIDDLEWARE
  // ============================================================
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
      if (!token) return next(new Error('Authentication required'));

      const decoded = verifyAccessToken(token);
      let user = userSessionCache.get(decoded.id);
      if (!user) {
        const User = require('../models/User');
        user = await User.findById(decoded.id).select('name role isActive').lean();
      }
      if (!user || !user.isActive) return next(new Error('User not found'));

      socket.userId = decoded.id;
      socket.userRole = user.role;
      socket.userName = user.name;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  // ============================================================
  // CONNECTION HANDLER
  // ============================================================
  io.on('connection', (socket) => {
    logger.info(`🔌 Socket connected: ${socket.id} | User: ${socket.userId} | Role: ${socket.userRole}`);

    // Join personal room for targeted notifications
    socket.join(`user_${socket.userId}`);

    // ---- DELIVERY TRACKING ----
    socket.on('join_delivery', (deliveryId) => {
      socket.join(`delivery_${deliveryId}`);
      logger.info(`User ${socket.userId} joined delivery room: ${deliveryId}`);
    });

    socket.on('leave_delivery', (deliveryId) => {
      socket.leave(`delivery_${deliveryId}`);
    });

    // ---- CHARTER TRACKING ----
    socket.on('join_charter', (charterId) => {
      socket.join(`charter_${charterId}`);
    });

    socket.on('charter_location', async (data) => {
      // Captain broadcasting location during active trip
      if (socket.userRole !== 'captain') return;
      const { charterId, lat, lng, speed, heading } = data;
      try {
        const { CharterBooking } = require('../models/OtherModels');
        await CharterBooking.findByIdAndUpdate(charterId, {
          $set: { 'currentLocation.lat': lat, 'currentLocation.lng': lng, 'currentLocation.updatedAt': new Date() },
          $push: { gpsTrail: { lat, lng, timestamp: new Date() } },
        });
        // Broadcast to all users in this charter's room
        io.to(`charter_${charterId}`).emit('charter_location_update', { charterId, lat, lng, speed, heading, timestamp: new Date().toISOString() });
      } catch (err) {
        logger.error(`Charter location update error: ${err.message}`);
      }
    });

    // ---- DRIVER LOCATION (for delivery tracking) ----
    socket.on('driver_location', (data) => {
      if (socket.userRole !== 'driver') return;
      const { deliveryId, lat, lng, speed, heading } = data;
      // Update GeoHash index - O(1)
      driverGeoIndex.insert(socket.userId, lat, lng, { deliveryId, socketId: socket.id });
      // Broadcast to delivery room
      io.to(`delivery_${deliveryId}`).emit('location_update', { deliveryId, lat, lng, speed, heading, timestamp: new Date().toISOString() });
    });

    // ---- NOTIFICATIONS ----
    socket.on('mark_notifications_read', async () => {
      try {
        const { Notification } = require('../models/OtherModels');
        await Notification.updateMany({ user: socket.userId, isRead: false }, { isRead: true, readAt: new Date() });
        socket.emit('notifications_cleared');
      } catch (err) { logger.error(err.message); }
    });

    // ---- YARD CAMERA FEED ----
    socket.on('join_camera_feed', (data) => {
      const { bookingId, cameraId } = data;
      socket.join(`camera_${cameraId}`);
      // TODO: Subscribe to CCTV API webhook/stream
      // Simulate periodic snapshots for demo
      const interval = setInterval(() => {
        socket.emit('camera_frame', {
          cameraId,
          timestamp: new Date().toISOString(),
          thumbnailUrl: `${process.env.CAMERA_API_BASE_URL}/snapshot/${cameraId}`,
          status: 'live',
        });
      }, 5000);
      socket.once('leave_camera_feed', () => clearInterval(interval));
    });

    // ---- BOOKING UPDATES ----
    socket.on('subscribe_booking', (bookingId) => {
      socket.join(`booking_${bookingId}`);
    });

    // ---- DISCONNECT ----
    socket.on('disconnect', (reason) => {
      logger.info(`🔌 Socket disconnected: ${socket.id} | Reason: ${reason}`);
      // Remove driver from geo index
      if (socket.userRole === 'driver') {
        // Note: Can't remove without knowing last position - handled in update
      }
    });

    socket.on('error', (error) => {
      logger.error(`Socket error for ${socket.id}: ${error.message}`);
    });
  });

  logger.info('✅ Socket.io initialized with GPS tracking, camera feeds, and real-time notifications');
  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized. Call initializeSocket first.');
  return io;
};

// Utility: Send notification to specific user
const notifyUser = (userId, event, data) => {
  if (!io) return;
  io.to(`user_${userId}`).emit(event, data);
};

// Utility: Broadcast to all connected drivers
const broadcastToDrivers = (event, data) => {
  if (!io) return;
  io.to('drivers').emit(event, data);
};

module.exports = { initializeSocket, getIO, notifyUser, broadcastToDrivers };
