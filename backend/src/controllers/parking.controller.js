const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { ParkingYard, ParkingBooking } = require('../models/ParkingModels');
const Boat = require('../models/Boat');
const { parkingSpotCache, yardGeoIndex } = require('../utils/dataStructures');

// @desc    Get all parking yards with filters
// @route   GET /api/v1/parking/yards
// @access  Public
exports.getYards = asyncHandler(async (req, res, next) => {
  const {
    emirate, minSpots = 1, maxPrice, minPrice,
    lat, lng, radiusKm = 50, sort = '-rating',
    page = 1, limit = 20, features
  } = req.query;

  const cacheKey = `yards:${JSON.stringify(req.query)}`;
  const cached = parkingSpotCache.get(cacheKey);
  if (cached) return res.status(200).json({ success: true, ...cached, fromCache: true });

  let query = { isActive: true, availableSpots: { $gte: parseInt(minSpots) } };

  if (emirate) query.emirate = emirate;
  if (maxPrice) query['pricing.ratePerFootPerMonth'] = { $lte: parseFloat(maxPrice) };
  if (minPrice) query['pricing.ratePerFootPerMonth'] = { ...query['pricing.ratePerFootPerMonth'], $gte: parseFloat(minPrice) };

  // Geospatial query: yards within radius
  if (lat && lng) {
    query.location = {
      $near: {
        $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
        $maxDistance: parseFloat(radiusKm) * 1000,
      }
    };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [yards, total] = await Promise.all([
    ParkingYard.find(query).sort(sort).skip(skip).limit(parseInt(limit)).lean(),
    ParkingYard.countDocuments(query),
  ]);

  const result = {
    count: yards.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: yards,
  };

  parkingSpotCache.put(cacheKey, result);
  res.status(200).json({ success: true, ...result });
});

// @desc    Get single yard with full details
// @route   GET /api/v1/parking/yards/:id
// @access  Public
exports.getYard = asyncHandler(async (req, res, next) => {
  const cacheKey = `yard:${req.params.id}`;
  const cached = parkingSpotCache.get(cacheKey);
  if (cached) return res.status(200).json({ success: true, data: cached });

  const yard = await ParkingYard.findById(req.params.id).lean();
  if (!yard) return next(new AppError('Parking yard not found', 404));

  parkingSpotCache.put(cacheKey, yard);
  res.status(200).json({ success: true, data: yard });
});

// @desc    Calculate parking pricing
// @route   POST /api/v1/parking/calculate-price
// @access  Public
exports.calculatePrice = asyncHandler(async (req, res, next) => {
  const { yardId, boatLengthFt, planType = 'monthly', months = 1 } = req.body;

  if (!yardId || !boatLengthFt) {
    return next(new AppError('Yard ID and boat length are required', 400));
  }

  const yard = await ParkingYard.findById(yardId).select('pricing name').lean();
  if (!yard) return next(new AppError('Yard not found', 404));

  const { ratePerFootPerMonth, annualDiscountPercent, launchFeePerTrip } = yard.pricing;
  const effectiveLength = Math.max(boatLengthFt, yard.pricing.minimumLengthFt || 15);
  const baseMonthlyRate = effectiveLength * ratePerFootPerMonth;

  let totalMonths, discount = 0, discountReason = '';

  switch (planType) {
    case 'monthly':   totalMonths = 1; break;
    case 'quarterly': totalMonths = 3; discount = 5; discountReason = '5% quarterly discount'; break;
    case 'annual':    totalMonths = 12; discount = annualDiscountPercent; discountReason = `${annualDiscountPercent}% annual discount`; break;
    default:          totalMonths = parseInt(months) || 1;
  }

  const subtotal = baseMonthlyRate * totalMonths;
  const discountAmount = (subtotal * discount) / 100;
  const totalAmount = subtotal - discountAmount;
  const taxAmount = totalAmount * 0.05; // 5% VAT
  const grandTotal = totalAmount + taxAmount;

  // Comparison: savings vs Dubai Creek Golf & Yacht Club (67 AED/ft/month)
  const competitorRate = 67;
  const competitorTotal = effectiveLength * competitorRate * totalMonths;
  const savings = competitorTotal - grandTotal;

  res.status(200).json({
    success: true,
    data: {
      yardName: yard.name,
      boatLengthFt: effectiveLength,
      ratePerFootPerMonth,
      baseMonthlyRate,
      planType,
      totalMonths,
      discount,
      discountReason,
      discountAmount: Math.round(discountAmount),
      subtotal: Math.round(subtotal),
      taxAmount: Math.round(taxAmount),
      grandTotal: Math.round(grandTotal),
      currency: 'AED',
      launchFeePerTrip,
      vsCompetitor: {
        competitorName: 'Dubai Creek Golf & Yacht Club',
        competitorRate: `${competitorRate} AED/ft/month`,
        competitorTotal: Math.round(competitorTotal),
        savingsAED: Math.round(savings),
        savingsPercent: Math.round((savings / competitorTotal) * 100),
      },
      breakdown: {
        '10ft example': Math.round(10 * ratePerFootPerMonth),
        '20ft example': Math.round(20 * ratePerFootPerMonth),
        '30ft example': Math.round(30 * ratePerFootPerMonth),
        '40ft example': Math.round(40 * ratePerFootPerMonth),
      }
    }
  });
});

// @desc    Check availability for a yard
// @route   GET /api/v1/parking/yards/:id/availability
// @access  Public
exports.checkAvailability = asyncHandler(async (req, res, next) => {
  const yard = await ParkingYard.findById(req.params.id)
    .select('availableSpots totalSpots maxBoatLengthFt name').lean();

  if (!yard) return next(new AppError('Yard not found', 404));

  const occupancyPercent = Math.round(((yard.totalSpots - yard.availableSpots) / yard.totalSpots) * 100);
  const isAvailable = yard.availableSpots > 0;

  res.status(200).json({
    success: true,
    data: {
      yardId: yard._id,
      yardName: yard.name,
      totalSpots: yard.totalSpots,
      availableSpots: yard.availableSpots,
      occupancyPercent,
      isAvailable,
      maxBoatLengthFt: yard.maxBoatLengthFt,
      urgency: yard.availableSpots <= 3 ? 'Only ' + yard.availableSpots + ' spots left!' : null,
    }
  });
});

// @desc    Create parking booking
// @route   POST /api/v1/parking/book
// @access  Private
exports.createBooking = asyncHandler(async (req, res, next) => {
  const { yardId, boatId, planType, startDate, paymentMethod } = req.body;

  // Validate ownership of boat
  const boat = await Boat.findOne({ _id: boatId, owner: req.user._id });
  if (!boat) return next(new AppError('Boat not found or not owned by you', 404));

  // Check if boat already has active parking
  const existingBooking = await ParkingBooking.findOne({
    boat: boatId,
    status: { $in: ['confirmed', 'active'] },
  });
  if (existingBooking) {
    return next(new AppError('This boat already has an active parking booking', 409));
  }

  const yard = await ParkingYard.findById(yardId);
  if (!yard) return next(new AppError('Parking yard not found', 404));
  if (!yard.isActive) return next(new AppError('This yard is currently unavailable', 400));
  if (yard.availableSpots < 1) return next(new AppError('No spots available at this yard', 400));
  if (boat.dimensions.lengthFt > yard.maxBoatLengthFt) {
    return next(new AppError(`Boat length (${boat.dimensions.lengthFt}ft) exceeds yard maximum (${yard.maxBoatLengthFt}ft)`, 400));
  }

  // Calculate pricing
  const effectiveLength = Math.max(boat.dimensions.lengthFt, yard.pricing.minimumLengthFt || 15);
  const baseMonthlyRate = effectiveLength * yard.pricing.ratePerFootPerMonth;
  let totalMonths, discount = 0, discountReason = '';
  let start = new Date(startDate);
  let end = new Date(start);

  switch (planType) {
    case 'monthly':   totalMonths = 1; end.setMonth(end.getMonth() + 1); break;
    case 'quarterly': totalMonths = 3; discount = 5; discountReason = '5% quarterly'; end.setMonth(end.getMonth() + 3); break;
    case 'annual':    totalMonths = 12; discount = yard.pricing.annualDiscountPercent; discountReason = `${discount}% annual`; end.setFullYear(end.getFullYear() + 1); break;
    default: return next(new AppError('Invalid plan type', 400));
  }

  const subtotal = baseMonthlyRate * totalMonths;
  const discountAmt = (subtotal * discount) / 100;
  const totalAmount = subtotal - discountAmt;
  const taxAmount = totalAmount * 0.05;
  const grandTotal = Math.round(totalAmount + taxAmount);

  // Create booking
  const booking = await ParkingBooking.create({
    user: req.user._id,
    boat: boatId,
    yard: yardId,
    planType,
    startDate: start,
    endDate: end,
    nextRenewalDate: end,
    pricing: {
      boatLengthFt: effectiveLength,
      ratePerFootPerMonth: yard.pricing.ratePerFootPerMonth,
      baseMonthlyRate,
      discount,
      discountReason,
      totalAmount,
      taxAmount,
      grandTotal,
      currency: 'AED',
    },
    status: 'pending_payment',
  });

  // Decrement available spots
  await ParkingYard.findByIdAndUpdate(yardId, { $inc: { availableSpots: -1 } });

  // Invalidate cache
  parkingSpotCache.invalidatePattern(`yard:${yardId}`);
  parkingSpotCache.invalidatePattern('yards:');

  // TODO: Process payment via Stripe
  // const paymentIntent = await stripe.paymentIntents.create({...});

  res.status(201).json({
    success: true,
    message: 'Booking created. Complete payment to confirm.',
    data: booking,
  });
});

// @desc    Get user's parking bookings
// @route   GET /api/v1/parking/bookings
// @access  Private
exports.getMyBookings = asyncHandler(async (req, res, next) => {
  const { status, page = 1, limit = 10 } = req.query;
  let query = { user: req.user._id };
  if (status) query.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [bookings, total] = await Promise.all([
    ParkingBooking.find(query)
      .populate('boat', 'name type dimensions.lengthFt primaryPhoto status')
      .populate('yard', 'name area emirate location contact pricing.ratePerFootPerMonth')
      .sort('-createdAt').skip(skip).limit(parseInt(limit)).lean(),
    ParkingBooking.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: bookings.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: bookings,
  });
});

// @desc    Cancel parking booking
// @route   PUT /api/v1/parking/bookings/:id/cancel
// @access  Private
exports.cancelBooking = asyncHandler(async (req, res, next) => {
  const { reason } = req.body;
  const booking = await ParkingBooking.findOne({ _id: req.params.id, user: req.user._id });

  if (!booking) return next(new AppError('Booking not found', 404));
  if (['cancelled', 'expired'].includes(booking.status)) {
    return next(new AppError('Booking is already cancelled or expired', 400));
  }

  booking.status = 'cancelled';
  booking.cancellationDate = new Date();
  booking.cancellationReason = reason || 'Cancelled by user';
  booking.autoRenew = false;
  await booking.save();

  // Release spot
  await ParkingYard.findByIdAndUpdate(booking.yard, { $inc: { availableSpots: 1 } });

  // Update boat status
  await Boat.findByIdAndUpdate(booking.boat, {
    $unset: { currentParking: 1 },
    status: 'in_water',
  });

  // TODO: Process refund based on cancellation policy

  parkingSpotCache.invalidatePattern(`yard:${booking.yard}`);

  res.status(200).json({ success: true, message: 'Booking cancelled successfully', data: booking });
});

// @desc    Get camera feeds for user's parked boat
// @route   GET /api/v1/parking/camera/:bookingId
// @access  Private
exports.getCameraFeed = asyncHandler(async (req, res, next) => {
  const booking = await ParkingBooking.findOne({
    _id: req.params.bookingId,
    user: req.user._id,
    status: 'active',
  }).populate('yard', 'cameraFeeds name');

  if (!booking) return next(new AppError('Active booking not found', 404));

  const boat = await Boat.findById(booking.boat).select('currentParking name');
  const cameraId = boat?.currentParking?.cameraId;

  // Return camera feeds for this yard
  // In production: connect to real CCTV API
  const feeds = booking.yard.cameraFeeds?.map(cam => ({
    ...cam,
    // Generate signed URL for secure stream access
    streamUrl: cam.isActive
      ? `${process.env.CAMERA_API_BASE_URL}/stream/${cam.cameraId}?token=${generateCameraToken(req.user._id, cam.cameraId)}`
      : null,
    thumbnailUrl: cam.thumbnailUrl || `${process.env.CAMERA_API_BASE_URL}/snapshot/${cam.cameraId}`,
  })) || [];

  res.status(200).json({
    success: true,
    data: {
      yardName: booking.yard.name,
      spotNumber: booking.spotNumber,
      boatSpotCamera: cameraId || 'CAM_A1',
      feeds,
      lastUpdated: new Date().toISOString(),
      // Placeholder until real CCTV integration
      demoFeedUrl: 'https://www.youtube.com/embed/placeholder',
    }
  });
});

const generateCameraToken = (userId, cameraId) => {
  const crypto = require('crypto');
  return crypto.createHash('sha256')
    .update(`${userId}:${cameraId}:${process.env.CAMERA_API_KEY}:${Date.now()}`)
    .digest('hex');
};
