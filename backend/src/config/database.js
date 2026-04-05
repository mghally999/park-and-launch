const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  const MAX_RETRIES = 5;
  let retries = 0;

  const connect = async () => {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        maxPoolSize: 50,
        minPoolSize: 5,
      });

      logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);

      // Connection event listeners
      mongoose.connection.on('disconnected', () => {
        logger.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
        setTimeout(connect, 5000);
      });

      mongoose.connection.on('error', (err) => {
        logger.error(`MongoDB connection error: ${err.message}`);
      });

    } catch (error) {
      retries++;
      logger.error(`MongoDB connection failed (attempt ${retries}/${MAX_RETRIES}): ${error.message}`);

      if (retries < MAX_RETRIES) {
        logger.info(`Retrying in 5 seconds...`);
        setTimeout(connect, 5000);
      } else {
        logger.error('Max MongoDB reconnection attempts reached. Exiting...');
        process.exit(1);
      }
    }
  };

  await connect();
};

module.exports = connectDB;
