require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/database');
const { initializeSocket } = require('./src/services/socket.service');
const logger = require('./src/utils/logger');
const { startScheduledJobs } = require('./src/services/scheduler.service');

const PORT = process.env.PORT || 3001;

connectDB();

const server = http.createServer(app);

initializeSocket(server);
startScheduledJobs();

server.listen(PORT, () => {
  logger.info(`🚢 Park & Launch API running on port ${PORT}`);
  logger.info(`📡 WebSocket server ready`);
  logger.info(`🌍 http://localhost:${PORT}/health`);
});

const shutdown = (signal) => {
  logger.info(`${signal} received. Shutting down...`);
  server.close(() => { logger.info('Server closed.'); process.exit(0); });
  setTimeout(() => process.exit(1), 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (err) => { logger.error(`Unhandled Rejection: ${err.message}`); });
process.on('uncaughtException', (err) => { logger.error(`Uncaught Exception: ${err.message}`); process.exit(1); });
