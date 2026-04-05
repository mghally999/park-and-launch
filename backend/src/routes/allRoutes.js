// ============================================================
// AUTH ROUTES - /api/v1/auth
// ============================================================
const express = require('express');
const authRouter = express.Router();
const authCtrl = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');

authRouter.post('/register', authCtrl.register);
authRouter.post('/login', authCtrl.login);
authRouter.post('/logout', protect, authCtrl.logout);
authRouter.post('/refresh-token', authCtrl.refreshToken);
authRouter.post('/verify-otp', protect, authCtrl.verifyOTP);
authRouter.post('/resend-otp', protect, authCtrl.resendOTP);
authRouter.post('/forgot-password', authCtrl.forgotPassword);
authRouter.post('/reset-password', authCtrl.resetPassword);
authRouter.put('/change-password', protect, authCtrl.changePassword);
authRouter.get('/me', protect, authCtrl.getMe);

module.exports = { authRouter };

// ============================================================
// PARKING ROUTES - /api/v1/parking
// ============================================================
const parkingRouter = express.Router();
const parkingCtrl = require('../controllers/parking.controller');

parkingRouter.get('/yards', parkingCtrl.getYards);
parkingRouter.get('/yards/:id', parkingCtrl.getYard);
parkingRouter.get('/yards/:id/availability', parkingCtrl.checkAvailability);
parkingRouter.post('/calculate-price', parkingCtrl.calculatePrice);
parkingRouter.post('/book', protect, parkingCtrl.createBooking);
parkingRouter.get('/bookings', protect, parkingCtrl.getMyBookings);
parkingRouter.put('/bookings/:id/cancel', protect, parkingCtrl.cancelBooking);
parkingRouter.get('/camera/:bookingId', protect, parkingCtrl.getCameraFeed);

module.exports.parkingRouter = parkingRouter;

// ============================================================
// DELIVERY ROUTES - /api/v1/delivery
// ============================================================
const deliveryRouter = express.Router();
const deliveryCtrl = require('../controllers/delivery.controller');
const { authorize } = require('../middleware/auth');

deliveryRouter.get('/marinas', deliveryCtrl.getMarinas);
deliveryRouter.get('/queue', protect, authorize('admin', 'driver', 'yard_staff'), deliveryCtrl.getDeliveryQueue);
deliveryRouter.post('/schedule', protect, deliveryCtrl.scheduleDelivery);
deliveryRouter.get('/history', protect, deliveryCtrl.getDeliveryHistory);
deliveryRouter.get('/:id/track', protect, deliveryCtrl.trackDelivery);
deliveryRouter.post('/:id/location', protect, authorize('driver'), deliveryCtrl.updateDriverLocation);
deliveryRouter.put('/:id/status', protect, deliveryCtrl.updateDeliveryStatus);

module.exports.deliveryRouter = deliveryRouter;

// ============================================================
// CHARTER ROUTES - /api/v1/charter
// ============================================================
const charterRouter = express.Router();
const charterCtrl = require('../controllers/charter.controller');

charterRouter.get('/captains', charterCtrl.getCaptains);
charterRouter.get('/packages', charterCtrl.getPackages);
charterRouter.post('/book', protect, charterCtrl.bookCharter);
charterRouter.get('/bookings', protect, charterCtrl.getMyCharters);
charterRouter.get('/bookings/:id/track', protect, charterCtrl.trackCharter);
charterRouter.put('/bookings/:id/respond', protect, authorize('captain'), charterCtrl.respondToBooking);
charterRouter.post('/bookings/:id/rate', protect, charterCtrl.rateCharter);

module.exports.charterRouter = charterRouter;

// ============================================================
// MARKETPLACE ROUTES - /api/v1/marketplace
// ============================================================
const marketplaceRouter = express.Router();
const mktCtrl = require('../controllers/marketplace.controller');

marketplaceRouter.get('/products', mktCtrl.getProducts);
marketplaceRouter.get('/categories', mktCtrl.getCategories);
marketplaceRouter.get('/products/:id', mktCtrl.getProduct);
marketplaceRouter.post('/products/:id/review', protect, mktCtrl.addReview);
marketplaceRouter.post('/orders', protect, mktCtrl.createOrder);
marketplaceRouter.get('/orders', protect, mktCtrl.getMyOrders);

module.exports.marketplaceRouter = marketplaceRouter;

// ============================================================
// SERVICES ROUTES - /api/v1/services
// ============================================================
const servicesRouter = express.Router();
const svcCtrl = require('../controllers/services.controller');

servicesRouter.get('/cleaning', svcCtrl.getCleaningPackages);
servicesRouter.post('/cleaning/book', protect, svcCtrl.bookCleaning);
servicesRouter.get('/equipment', svcCtrl.getFishingEquipment);

module.exports.servicesRouter = servicesRouter;

// ============================================================
// USER ROUTES - /api/v1/users
// ============================================================
const userRouter = express.Router();

userRouter.get('/profile', protect, svcCtrl.getProfile);
userRouter.put('/profile', protect, svcCtrl.updateProfile);
userRouter.put('/theme', protect, svcCtrl.updateTheme);
userRouter.get('/notifications', protect, svcCtrl.getNotifications);
userRouter.put('/notifications/:id/read', protect, svcCtrl.markNotificationRead);

module.exports.userRouter = userRouter;

// ============================================================
// BOAT ROUTES - /api/v1/boats
// ============================================================
const boatRouter = express.Router();

boatRouter.get('/', protect, svcCtrl.getMyBoats);
boatRouter.post('/', protect, svcCtrl.addBoat);
boatRouter.put('/:id', protect, svcCtrl.updateBoat);
boatRouter.delete('/:id', protect, svcCtrl.deleteBoat);
boatRouter.post('/:id/condition', protect, authorize('driver', 'yard_staff', 'admin'), svcCtrl.logCondition);

module.exports.boatRouter = boatRouter;

// ============================================================
// WEATHER ROUTES - /api/v1/weather
// ============================================================
const weatherRouter = express.Router();
weatherRouter.get('/marine', svcCtrl.getMarineWeather);
module.exports.weatherRouter = weatherRouter;

// ============================================================
// ANALYTICS ROUTES - /api/v1/analytics
// ============================================================
const analyticsRouter = express.Router();
const { ParkingBooking } = require('../models/ParkingModels');
const { CharterBooking, Order } = require('../models/OtherModels');

analyticsRouter.get('/dashboard', protect, authorize('admin', 'super_admin'), async (req, res) => {
  const [totalBookings, totalCharters, totalOrders, activeBookings] = await Promise.all([
    ParkingBooking.countDocuments(),
    CharterBooking.countDocuments(),
    Order.countDocuments(),
    ParkingBooking.countDocuments({ status: 'active' }),
  ]);
  const revenue = await ParkingBooking.aggregate([
    { $match: { status: { $in: ['active', 'expired'] } } },
    { $group: { _id: null, total: { $sum: '$pricing.grandTotal' } } },
  ]);
  res.status(200).json({
    success: true,
    data: { totalBookings, totalCharters, totalOrders, activeBookings, totalRevenue: revenue[0]?.total || 0 }
  });
});
module.exports.analyticsRouter = analyticsRouter;

// ============================================================
// ADMIN ROUTES - /api/v1/admin
// ============================================================
const adminRouter = express.Router();
const { ParkingYard } = require('../models/ParkingModels');
const User = require('../models/User');

adminRouter.use(protect, authorize('admin', 'super_admin'));

adminRouter.get('/users', async (req, res) => {
  const users = await User.find().select('-password -otpHash -refreshTokens').sort('-createdAt').limit(100).lean();
  res.status(200).json({ success: true, count: users.length, data: users });
});

adminRouter.post('/yards', async (req, res) => {
  const yard = await ParkingYard.create(req.body);
  res.status(201).json({ success: true, data: yard });
});

adminRouter.put('/yards/:id', async (req, res) => {
  const yard = await ParkingYard.findByIdAndUpdate(req.params.id, req.body, { new: true });
  const { parkingSpotCache } = require('../utils/dataStructures');
  parkingSpotCache.invalidatePattern('yard:');
  parkingSpotCache.invalidatePattern('yards:');
  res.status(200).json({ success: true, data: yard });
});

adminRouter.get('/bookings', async (req, res) => {
  const bookings = await ParkingBooking.find()
    .populate('user', 'name email phone')
    .populate('boat', 'name type dimensions.lengthFt')
    .populate('yard', 'name area emirate')
    .sort('-createdAt').limit(100).lean();
  res.status(200).json({ success: true, count: bookings.length, data: bookings });
});

module.exports.adminRouter = adminRouter;
