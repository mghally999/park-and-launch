const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { CharterBooking } = require('../models/OtherModels');
const User = require('../models/User');
const Boat = require('../models/Boat');
const { getIO } = require('../services/socket.service');

// @desc    Get available captains/charters
// @route   GET /api/v1/charter/captains
// @access  Public
exports.getCaptains = asyncHandler(async (req, res, next) => {
  const { type, date, passengers, lat, lng, minPrice, maxPrice, sort = '-captainProfile.rating', page = 1, limit = 20 } = req.query;

  const query = {
    role: 'captain',
    isActive: true,
    'captainProfile.isAvailable': true,
    'captainProfile.licenseExpiry': { $gt: new Date() },
  };

  const captains = await User.find(query)
    .select('name avatar captainProfile address preferences.language')
    .sort(sort)
    .skip((parseInt(page) - 1) * parseInt(limit))
    .limit(parseInt(limit))
    .lean();

  // For each captain get their available boats
  const captainsWithBoats = await Promise.all(captains.map(async (captain) => {
    const boats = await Boat.find({
      owner: captain._id,
      'charter.isAvailable': true,
      isActive: true,
    }).select('name type dimensions capacity charter.pricePerHour charter.pricePerDay charter.features primaryPhoto').lean();
    return { ...captain, availableBoats: boats };
  }));

  res.status(200).json({
    success: true,
    count: captainsWithBoats.length,
    data: captainsWithBoats,
  });
});

// @desc    Get charter trip types and prices
// @route   GET /api/v1/charter/packages
// @access  Public
exports.getPackages = asyncHandler(async (req, res, next) => {
  const packages = [
    {
      type: 'fishing',
      title: 'Deep Sea Fishing',
      description: 'Full-day fishing experience in the Arabian Gulf. Equipment included.',
      durationOptions: [4, 6, 8, 12],
      pricePerHour: { min: 250, max: 800 },
      includes: ['Captain & crew', 'Fishing rods & reels', 'Bait', 'Life jackets', 'Refreshments'],
      maxPassengers: 8,
      popular: true,
      image: null,
    },
    {
      type: 'sunset_cruise',
      title: 'Sunset Cruise',
      description: 'Luxury cruise along the Dubai Marina skyline at golden hour.',
      durationOptions: [2, 3],
      pricePerHour: { min: 400, max: 1200 },
      includes: ['Captain', 'Refreshments', 'Bluetooth speaker', 'Photos'],
      maxPassengers: 12,
      popular: true,
      image: null,
    },
    {
      type: 'island_hopping',
      title: 'Island Hopping',
      description: 'Explore the World Islands, Palm Jumeirah, and hidden sandbars.',
      durationOptions: [4, 6, 8],
      pricePerHour: { min: 500, max: 1500 },
      includes: ['Captain', 'Snorkeling gear', 'BBQ', 'Refreshments'],
      maxPassengers: 10,
      popular: false,
      image: null,
    },
    {
      type: 'leisure_cruise',
      title: 'Private Leisure Cruise',
      description: 'Your private vessel, your itinerary. Dubai Marina to Palm and back.',
      durationOptions: [2, 4, 6, 8],
      pricePerHour: { min: 350, max: 1000 },
      includes: ['Captain', 'Refreshments', 'Music system'],
      maxPassengers: 15,
      popular: false,
      image: null,
    },
    {
      type: 'corporate',
      title: 'Corporate Charter',
      description: 'Impress clients with a luxury corporate event on the water.',
      durationOptions: [4, 6, 8],
      pricePerHour: { min: 800, max: 3000 },
      includes: ['Captain & crew', 'Catering', 'AV system', 'Branding options', 'Photographer'],
      maxPassengers: 30,
      popular: false,
      image: null,
    },
  ];

  res.status(200).json({ success: true, count: packages.length, data: packages });
});

// @desc    Book a charter (Uber-for-fishing)
// @route   POST /api/v1/charter/book
// @access  Private
exports.bookCharter = asyncHandler(async (req, res, next) => {
  const {
    captainId, boatId, type, date, startTime, durationHours,
    departureMarina, passengers, addOns = [], fishingEquipment = [],
    bait = [], specialRequests,
  } = req.body;

  // Validate captain
  const captain = await User.findOne({ _id: captainId, role: 'captain', 'captainProfile.isAvailable': true });
  if (!captain) return next(new AppError('Captain not available', 404));

  // Validate captain license
  if (captain.captainProfile.licenseExpiry < new Date()) {
    return next(new AppError('Captain license has expired', 400));
  }

  // Check for booking conflict on that date/time
  const bookingDate = new Date(date);
  const conflict = await CharterBooking.findOne({
    captain: captainId,
    date: {
      $gte: new Date(bookingDate.setHours(0, 0, 0)),
      $lte: new Date(bookingDate.setHours(23, 59, 59)),
    },
    status: { $in: ['confirmed', 'in_progress'] },
  });
  if (conflict) return next(new AppError('Captain is already booked for this date', 409));

  // Validate boat if specified
  let boat = null;
  if (boatId) {
    boat = await Boat.findOne({ _id: boatId, 'charter.isAvailable': true });
    if (!boat) return next(new AppError('Boat not available for charter', 404));
  } else {
    // Auto-assign available captain boat
    boat = await Boat.findOne({ owner: captainId, 'charter.isAvailable': true });
  }

  // Calculate pricing
  const hourlyRate = boat?.charter?.pricePerHour || captain.captainProfile.vessel?.capacity * 50 || 400;
  const basePrice = hourlyRate * durationHours;

  const addOnsTotal = addOns.reduce((sum, a) => sum + (a.price * a.quantity), 0);
  const equipmentTotal = fishingEquipment.reduce((sum, e) => sum + (e.price * e.quantity), 0);
  const baitTotal = bait.reduce((sum, b) => sum + (b.price * b.quantity), 0);
  const serviceFee = Math.round(basePrice * 0.12); // 12% platform fee
  const totalAmount = basePrice + addOnsTotal + equipmentTotal + baitTotal + serviceFee;
  const depositAmount = Math.round(totalAmount * 0.30); // 30% deposit

  const booking = await CharterBooking.create({
    user: req.user._id,
    captain: captainId,
    boat: boat?._id,
    type,
    date: new Date(date),
    startTime,
    durationHours,
    departureMarina: {
      name: departureMarina?.name || 'Dubai Marina',
      location: {
        type: 'Point',
        coordinates: departureMarina?.coordinates || [55.1404, 25.0774],
      },
      pier: departureMarina?.pier,
    },
    passengers: {
      adults: passengers?.adults || 1,
      children: passengers?.children || 0,
    },
    addOns,
    fishingEquipment,
    bait,
    pricing: {
      basePrice,
      addOnsTotal: addOnsTotal + equipmentTotal + baitTotal,
      equipmentTotal,
      serviceFee,
      totalAmount,
      depositPaid: 0,
      balanceDue: totalAmount,
      currency: 'AED',
    },
    status: 'pending',
    specialRequests,
  });

  // Notify captain via Socket.io
  const io = getIO();
  io.to(`user_${captainId}`).emit('new_booking_request', {
    bookingId: booking._id,
    bookingRef: booking.bookingRef,
    type: booking.type,
    date: booking.date,
    startTime: booking.startTime,
    durationHours: booking.durationHours,
    passengers: booking.passengers,
    totalAmount,
    userName: req.user.name,
  });

  res.status(201).json({
    success: true,
    message: 'Charter booking request sent to captain',
    data: {
      booking,
      paymentRequired: {
        depositAmount,
        depositPercent: 30,
        fullAmount: totalAmount,
        currency: 'AED',
      },
    }
  });
});

// @desc    Get charter booking details + live tracking
// @route   GET /api/v1/charter/bookings/:id/track
// @access  Private
exports.trackCharter = asyncHandler(async (req, res, next) => {
  const booking = await CharterBooking.findOne({
    _id: req.params.id,
    $or: [{ user: req.user._id }, { captain: req.user._id }],
  })
  .populate('captain', 'name phone avatar captainProfile')
  .populate('boat', 'name type primaryPhoto dimensions capacity')
  .lean();

  if (!booking) return next(new AppError('Booking not found', 404));

  res.status(200).json({
    success: true,
    data: {
      ...booking,
      liveTracking: {
        socketRoom: `charter_${booking._id}`,
        currentLocation: booking.currentLocation,
        gpsTrailLength: booking.gpsTrail?.length || 0,
      }
    }
  });
});

// @desc    Captain accepts/rejects booking
// @route   PUT /api/v1/charter/bookings/:id/respond
// @access  Private (captain)
exports.respondToBooking = asyncHandler(async (req, res, next) => {
  const { accept, rejectionReason } = req.body;

  const booking = await CharterBooking.findOne({ _id: req.params.id, captain: req.user._id, status: 'pending' });
  if (!booking) return next(new AppError('Pending booking not found', 404));

  booking.status = accept ? 'confirmed' : 'cancelled';
  if (!accept) booking.cancellationReason = rejectionReason || 'Captain declined';
  await booking.save();

  const io = getIO();
  io.to(`user_${booking.user}`).emit('booking_response', {
    bookingRef: booking.bookingRef,
    status: booking.status,
    message: accept ? 'Your charter booking has been confirmed!' : `Booking declined: ${rejectionReason}`,
  });

  res.status(200).json({ success: true, data: booking });
});

// @desc    Rate charter after completion
// @route   POST /api/v1/charter/bookings/:id/rate
// @access  Private
exports.rateCharter = asyncHandler(async (req, res, next) => {
  const { rating, review } = req.body;

  const booking = await CharterBooking.findOne({ _id: req.params.id, user: req.user._id, status: 'completed' });
  if (!booking) return next(new AppError('Completed booking not found', 404));
  if (booking.captainRating) return next(new AppError('Already rated', 400));

  booking.captainRating = rating;
  booking.review = review;
  await booking.save();

  // Update captain's average rating
  const allRatings = await CharterBooking.find({ captain: booking.captain, captainRating: { $exists: true } }).select('captainRating').lean();
  const avgRating = allRatings.reduce((sum, b) => sum + b.captainRating, 0) / allRatings.length;
  await User.findByIdAndUpdate(booking.captain, {
    'captainProfile.rating': Math.round(avgRating * 10) / 10,
    $inc: { 'captainProfile.totalTrips': 0 },
  });

  res.status(200).json({ success: true, message: 'Rating submitted', data: booking });
});

// @desc    Get user's charter history
// @route   GET /api/v1/charter/bookings
// @access  Private
exports.getMyCharters = asyncHandler(async (req, res, next) => {
  const { status, page = 1, limit = 10 } = req.query;
  const isCapt = req.user.role === 'captain';
  const query = isCapt ? { captain: req.user._id } : { user: req.user._id };
  if (status) query.status = status;

  const [bookings, total] = await Promise.all([
    CharterBooking.find(query)
      .populate(isCapt ? 'user' : 'captain', 'name phone avatar captainProfile.rating')
      .populate('boat', 'name type primaryPhoto')
      .select('-gpsTrail')
      .sort('-createdAt')
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .lean(),
    CharterBooking.countDocuments(query),
  ]);

  res.status(200).json({ success: true, count: bookings.length, total, data: bookings });
});
