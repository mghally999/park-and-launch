const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');

const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// Route imports
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const boatRoutes = require('./routes/boat.routes');
const parkingRoutes = require('./routes/parking.routes');
const charterRoutes = require('./routes/charter.routes');
const marketplaceRoutes = require('./routes/marketplace.routes');
const deliveryRoutes = require('./routes/delivery.routes');
const servicesRoutes = require('./routes/services.routes');
const paymentRoutes = require('./routes/payment.routes');
const weatherRoutes = require('./routes/weather.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Set security HTTP headers
app.use(helmet({
  contentSecurityPolicy: false, // Configured separately for API
  crossOriginEmbedderPolicy: false,
}));

// CORS Configuration
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Device-ID'],
}));

// Rate Limiting - General API
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
  skipSuccessfulRequests: true,
});

app.use('/api/v1/', generalLimiter);
app.use('/api/v1/auth', authLimiter);

// ============================================
// BODY PARSING MIDDLEWARE
// ============================================

// Stripe webhook needs raw body
app.use('/api/v1/payments/webhook', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ============================================
// DATA SANITIZATION
// ============================================

// Sanitize data against NoSQL query injection
app.use(mongoSanitize());

// Sanitize data against XSS attacks
app.use(xss());

// Prevent HTTP Parameter Pollution
app.use(hpp({
  whitelist: ['price', 'rating', 'length', 'capacity', 'sort', 'limit', 'page'],
}));

// ============================================
// PERFORMANCE MIDDLEWARE
// ============================================

app.use(compression());

// ============================================
// LOGGING
// ============================================

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.http(message.trim()),
    },
  }));
}

// ============================================
// STATIC FILES
// ============================================

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🚢 Park & Launch API is operational',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
  });
});

// ============================================
// API ROUTES
// ============================================

const API = '/api/v1';

app.use(`${API}/auth`, authRoutes);
app.use(`${API}/users`, userRoutes);
app.use(`${API}/boats`, boatRoutes);
app.use(`${API}/parking`, parkingRoutes);
app.use(`${API}/charter`, charterRoutes);
app.use(`${API}/marketplace`, marketplaceRoutes);
app.use(`${API}/delivery`, deliveryRoutes);
app.use(`${API}/services`, servicesRoutes);
app.use(`${API}/payments`, paymentRoutes);
app.use(`${API}/weather`, weatherRoutes);
app.use(`${API}/analytics`, analyticsRoutes);
app.use(`${API}/admin`, adminRoutes);

// ============================================
// 404 HANDLER
// ============================================

app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found on this server`,
  });
});

// ============================================
// GLOBAL ERROR HANDLER
// ============================================

app.use(errorHandler);

module.exports = app;
