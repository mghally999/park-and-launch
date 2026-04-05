// ============================================================
// SERVICES CONTROLLER - Cleaning, Equipment, Add-ons
// ============================================================
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const Boat = require('../models/Boat');
const User = require('../models/User');
const https = require('https');

// @desc    Get cleaning packages
// @route   GET /api/v1/services/cleaning
// @access  Public
exports.getCleaningPackages = asyncHandler(async (req, res) => {
  const packages = [
    {
      id: 'basic_wash',
      name: 'Basic Wash',
      description: 'Exterior hull rinse, cockpit wipe-down, windows cleaned',
      durationHours: 1.5,
      priceAED: 180,
      includes: ['Hull exterior rinse', 'Cockpit wipe-down', 'Window cleaning', 'Teak rinse'],
      suitable: ['Under 25ft'],
    },
    {
      id: 'full_detail',
      name: 'Full Detail',
      description: 'Complete interior and exterior detailing with wax polish',
      durationHours: 4,
      priceAED: 450,
      includes: ['Full exterior wash & wax', 'Interior vacuum & wipe', 'Upholstery clean', 'Chrome polish', 'Teak scrub'],
      popular: true,
      suitable: ['25–45ft'],
    },
    {
      id: 'premium_spa',
      name: 'Premium Spa Treatment',
      description: 'Show-quality detailing, hull polish, anti-fouling bottom wash',
      durationHours: 8,
      priceAED: 1200,
      includes: ['All Full Detail items', 'Hull compound & polish', 'Anti-fouling bottom scrub', 'Bilge clean', 'Engine bay clean', 'Stainless steel polish'],
      suitable: ['45ft+'],
    },
    {
      id: 'anti_fouling',
      name: 'Anti-Fouling Bottom Paint',
      description: 'Marine-grade anti-fouling paint application (haulout required)',
      durationHours: 16,
      priceAED: 2500,
      note: 'Boat must be in dry dock. Pricing for boats up to 30ft.',
      includes: ['Bottom pressure wash', 'Sanding prep', 'Two-coat anti-fouling paint', 'Waterline tape'],
    },
  ];

  res.status(200).json({ success: true, count: packages.length, data: packages });
});

// @desc    Book cleaning service
// @route   POST /api/v1/services/cleaning/book
// @access  Private
exports.bookCleaning = asyncHandler(async (req, res, next) => {
  const { boatId, packageId, scheduledDate, scheduledTime, notes } = req.body;

  const boat = await Boat.findOne({ _id: boatId, owner: req.user._id });
  if (!boat) return next(new AppError('Boat not found', 404));
  if (!boat.currentParking?.spot && !boat.currentParking?.yardName) {
    return next(new AppError('Boat must be in a Park & Launch yard for cleaning service', 400));
  }

  // TODO: Create ServiceBooking model and record
  res.status(201).json({
    success: true,
    message: 'Cleaning service booked successfully',
    data: {
      boatName: boat.name,
      packageId,
      scheduledDate,
      scheduledTime,
      location: boat.currentParking.yardName,
      confirmationRef: `CLN${Date.now().toString(36).toUpperCase()}`,
      estimatedCompletion: `${scheduledDate} - after ${scheduledTime}`,
    }
  });
});

// @desc    Get fishing equipment & bait catalog
// @route   GET /api/v1/services/equipment
// @access  Public
exports.getFishingEquipment = asyncHandler(async (req, res) => {
  const equipment = {
    rods: [
      { id: 'rod_spinning', name: 'Spinning Rod (Medium)', priceAED: 45, pricePerTrip: true, brand: 'Shimano' },
      { id: 'rod_jigging', name: 'Jigging Rod (Heavy)', priceAED: 75, pricePerTrip: true, brand: 'Daiwa' },
      { id: 'rod_trolling', name: 'Trolling Rod Set (x2)', priceAED: 120, pricePerTrip: true, brand: 'Penn' },
    ],
    reels: [
      { id: 'reel_spinning', name: 'Spinning Reel 3000', priceAED: 35, pricePerTrip: true },
      { id: 'reel_overhead', name: 'Overhead Reel', priceAED: 55, pricePerTrip: true },
    ],
    bait: [
      { id: 'bait_live', name: 'Live Bait (Sardines - 50pcs)', priceAED: 60, perUnit: false },
      { id: 'bait_squid', name: 'Fresh Squid (1kg)', priceAED: 40, perUnit: false },
      { id: 'bait_shrimp', name: 'Tiger Shrimp Bait (500g)', priceAED: 50, perUnit: false },
      { id: 'bait_lure_pack', name: 'Lure Pack (Assorted 10pcs)', priceAED: 80, perUnit: false },
    ],
    tackle: [
      { id: 'tackle_box', name: 'Tackle Box (Complete)', priceAED: 30, pricePerTrip: true },
      { id: 'gaff', name: 'Gaff Hook', priceAED: 20, pricePerTrip: true },
      { id: 'ice_box', name: 'Ice Box (50L + Ice)', priceAED: 40, pricePerTrip: true },
      { id: 'fish_ruler', name: 'Fish Measuring Board', priceAED: 10, pricePerTrip: true },
    ],
    safety: [
      { id: 'life_jacket', name: 'Life Jacket (Adult)', priceAED: 15, pricePerTrip: true },
      { id: 'first_aid', name: 'Marine First Aid Kit', priceAED: 25, pricePerTrip: true },
    ],
  };

  res.status(200).json({ success: true, data: equipment });
});

// ============================================================
// WEATHER CONTROLLER
// ============================================================

// @desc    Get marine weather + tides for Dubai
// @route   GET /api/v1/weather/marine
// @access  Public
exports.getMarineWeather = asyncHandler(async (req, res, next) => {
  const { lat = 25.2048, lng = 55.2708 } = req.query;

  // Fetch from OpenWeatherMap (free tier: 60 calls/min)
  // API: https://api.openweathermap.org/data/2.5/weather
  const apiKey = process.env.OPENWEATHER_API_KEY;

  // Return mock data if no API key (development)
  if (!apiKey || apiKey === 'your_openweather_key') {
    return res.status(200).json({
      success: true,
      fromMock: true,
      data: {
        location: 'Dubai, UAE',
        current: {
          temp: 34, feelsLike: 38, humidity: 65,
          windSpeed: 15, windDirection: 'NNW',
          waveHeight: 0.8, visibility: 10,
          condition: 'Clear', conditionCode: 'clear-day',
          uvIndex: 9, pressure: 1010,
          description: 'Sunny with light northwesterly breeze',
          seaTemp: 31,
          marineConditions: 'Good - Suitable for all vessels',
          safetyLevel: 'green',
        },
        forecast: [
          { day: 'Today', tempHigh: 38, tempLow: 28, waveHeight: 0.8, windSpeed: 15, condition: 'Sunny', safetyLevel: 'green' },
          { day: 'Tomorrow', tempHigh: 37, tempLow: 27, waveHeight: 1.2, windSpeed: 20, condition: 'Partly Cloudy', safetyLevel: 'green' },
          { day: 'Wednesday', tempHigh: 36, tempLow: 26, waveHeight: 1.5, windSpeed: 25, condition: 'Breezy', safetyLevel: 'yellow' },
          { day: 'Thursday', tempHigh: 35, tempLow: 25, waveHeight: 0.6, windSpeed: 12, condition: 'Sunny', safetyLevel: 'green' },
          { day: 'Friday', tempHigh: 39, tempLow: 29, waveHeight: 0.9, windSpeed: 18, condition: 'Sunny', safetyLevel: 'green' },
        ],
        tides: [
          { time: '04:30', type: 'Low', heightM: 0.4 },
          { time: '10:45', type: 'High', heightM: 2.1 },
          { time: '16:55', type: 'Low', heightM: 0.3 },
          { time: '23:10', type: 'High', heightM: 1.9 },
        ],
        bestFishingTimes: ['05:30 - 07:30', '18:00 - 20:00'],
        marineAlerts: [],
        sunriseSunset: { sunrise: '05:47', sunset: '19:08' },
      }
    });
  }

  // Real OpenWeather API call
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`;
  // TODO: fetch and map real API response
  res.status(200).json({ success: true, data: { message: 'Configure OPENWEATHER_API_KEY in .env' } });
});

// ============================================================
// BOAT CONTROLLER
// ============================================================

// @desc    Get user's boats
// @route   GET /api/v1/boats
// @access  Private
exports.getMyBoats = asyncHandler(async (req, res) => {
  const boats = await Boat.find({ owner: req.user._id, isActive: true })
    .populate('currentParking.spot', 'name area')
    .sort('-createdAt').lean();
  res.status(200).json({ success: true, count: boats.length, data: boats });
});

// @desc    Add a boat
// @route   POST /api/v1/boats
// @access  Private
exports.addBoat = asyncHandler(async (req, res, next) => {
  req.body.owner = req.user._id;
  const boat = await Boat.create(req.body);
  res.status(201).json({ success: true, message: 'Boat added successfully', data: boat });
});

// @desc    Update a boat
// @route   PUT /api/v1/boats/:id
// @access  Private
exports.updateBoat = asyncHandler(async (req, res, next) => {
  const boat = await Boat.findOne({ _id: req.params.id, owner: req.user._id });
  if (!boat) return next(new AppError('Boat not found or not owned by you', 404));

  const disallowed = ['owner', 'registrationNumber', 'conditionReports'];
  disallowed.forEach(field => delete req.body[field]);

  const updated = await Boat.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.status(200).json({ success: true, data: updated });
});

// @desc    Delete (deactivate) a boat
// @route   DELETE /api/v1/boats/:id
// @access  Private
exports.deleteBoat = asyncHandler(async (req, res, next) => {
  const boat = await Boat.findOne({ _id: req.params.id, owner: req.user._id });
  if (!boat) return next(new AppError('Boat not found', 404));
  await Boat.findByIdAndUpdate(req.params.id, { isActive: false });
  res.status(200).json({ success: true, message: 'Boat removed from your account' });
});

// @desc    Log boat condition (pre/post tow)
// @route   POST /api/v1/boats/:id/condition
// @access  Private (driver, yard_staff)
exports.logCondition = asyncHandler(async (req, res, next) => {
  const { type, condition, notes, photos } = req.body;
  const boat = await Boat.findById(req.params.id);
  if (!boat) return next(new AppError('Boat not found', 404));

  boat.conditionReports.push({ type, condition, notes, photos, reportedBy: req.user._id });
  await boat.save();

  res.status(201).json({ success: true, message: 'Condition report logged', data: boat.conditionReports.slice(-1)[0] });
});

// ============================================================
// USER CONTROLLER
// ============================================================

// @desc    Get user profile
// @route   GET /api/v1/users/profile
// @access  Private
exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('boats', 'name type dimensions.lengthFt status primaryPhoto charter.isAvailable')
    .lean();
  res.status(200).json({ success: true, data: user });
});

// @desc    Update user profile
// @route   PUT /api/v1/users/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const disallowed = ['password', 'email', 'role', 'isActive', 'walletBalance', 'loyaltyPoints'];
  disallowed.forEach(f => delete req.body[f]);

  const user = await User.findByIdAndUpdate(req.user._id, req.body, { new: true, runValidators: true });
  const { userSessionCache } = require('../utils/dataStructures');
  userSessionCache.delete(req.user._id.toString());

  res.status(200).json({ success: true, data: user });
});

// @desc    Update theme preference
// @route   PUT /api/v1/users/theme
// @access  Private
exports.updateTheme = asyncHandler(async (req, res, next) => {
  const { theme } = req.body;
  const validThemes = ['deep_ocean', 'pearl_harbor', 'midnight_marina'];
  if (!validThemes.includes(theme)) return next(new AppError('Invalid theme', 400));

  await User.findByIdAndUpdate(req.user._id, { 'preferences.theme': theme });
  res.status(200).json({ success: true, message: 'Theme updated', theme });
});

// @desc    Get user notifications
// @route   GET /api/v1/users/notifications
// @access  Private
exports.getNotifications = asyncHandler(async (req, res) => {
  const { Notification } = require('../models/OtherModels');
  const { page = 1, limit = 20, unreadOnly } = req.query;
  const query = { user: req.user._id };
  if (unreadOnly === 'true') query.isRead = false;

  const [notifications, unreadCount, total] = await Promise.all([
    Notification.find(query).sort('-createdAt').skip((parseInt(page) - 1) * 20).limit(20).lean(),
    Notification.countDocuments({ user: req.user._id, isRead: false }),
    Notification.countDocuments(query),
  ]);

  res.status(200).json({ success: true, count: notifications.length, unreadCount, total, data: notifications });
});

// @desc    Mark notification as read
// @route   PUT /api/v1/users/notifications/:id/read
// @access  Private
exports.markNotificationRead = asyncHandler(async (req, res) => {
  const { Notification } = require('../models/OtherModels');
  const notif = req.params.id === 'all'
    ? await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true, readAt: new Date() })
    : await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { isRead: true, readAt: new Date() });
  res.status(200).json({ success: true, message: 'Marked as read' });
});

module.exports = exports;
