const { asyncHandler, AppError } = require('../middleware/errorHandler');
const Delivery = require('../models/Delivery');
const Boat = require('../models/Boat');
const { ParkingBooking, ParkingYard } = require('../models/ParkingModels');
const { deliveryQueue, driverGeoIndex } = require('../utils/dataStructures');
const { getIO } = require('../services/socket.service');

// Popular Dubai marinas for delivery destinations
const POPULAR_MARINAS = [
  { name: 'Dubai Marina Mall', location: { coordinates: [55.1404, 25.0774] } },
  { name: 'Palm Jumeirah Marina', location: { coordinates: [55.1178, 25.1127] } },
  { name: 'Dubai Creek', location: { coordinates: [55.3241, 25.2285] } },
  { name: 'Jumeirah Beach', location: { coordinates: [55.2006, 25.2048] } },
  { name: 'Port Rashid Marina', location: { coordinates: [55.2812, 25.2494] } },
  { name: 'Ras Al Khor Wildlife', location: { coordinates: [55.3569, 25.1887] } },
  { name: 'Dubai Festival City Marina', location: { coordinates: [55.3534, 25.2238] } },
  { name: 'Deira Slipway', location: { coordinates: [55.3325, 25.2769] } },
];

// @desc    Schedule a delivery (yard -> slipway/marina)
// @route   POST /api/v1/delivery/schedule
// @access  Private
exports.scheduleDelivery = asyncHandler(async (req, res, next) => {
  const {
    boatId, bookingId, type = 'yard_to_slipway',
    destinationName, destinationLat, destinationLng,
    scheduledDate, scheduledTime, notes,
  } = req.body;

  // Verify boat ownership
  const boat = await Boat.findOne({ _id: boatId, owner: req.user._id });
  if (!boat) return next(new AppError('Boat not found or not owned by you', 404));

  // Verify active parking booking
  const booking = await ParkingBooking.findOne({
    _id: bookingId,
    boat: boatId,
    user: req.user._id,
    status: 'active',
  }).populate('yard', 'name address location slipways pricing.launchFeePerTrip');

  if (!booking) return next(new AppError('No active parking booking found for this boat', 404));

  // Find destination
  let destination = {};
  if (destinationName && destinationLat && destinationLng) {
    destination = {
      type: 'custom',
      name: destinationName,
      location: { type: 'Point', coordinates: [parseFloat(destinationLng), parseFloat(destinationLat)] },
    };
  } else {
    // Use nearest yard slipway
    const slipway = booking.yard.slipways?.find(s => s.isOperational);
    if (slipway) {
      destination = {
        type: 'slipway',
        name: slipway.name,
        marinaPier: slipway.marinaName,
        location: slipway.location,
        address: slipway.marinaName,
      };
    } else {
      destination = {
        type: 'slipway',
        name: 'Public Slipway - Deira',
        location: { type: 'Point', coordinates: [55.3325, 25.2769] },
      };
    }
  }

  // Calculate delivery pricing
  const launchFee = booking.yard.pricing?.launchFeePerTrip || 150;
  const totalAmount = launchFee;

  // Parse scheduled datetime for priority queue
  const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
  if (scheduledDateTime < new Date(Date.now() + 2 * 60 * 60 * 1000)) {
    return next(new AppError('Delivery must be scheduled at least 2 hours in advance', 400));
  }

  const delivery = await Delivery.create({
    user: req.user._id,
    boat: boatId,
    parkingBooking: bookingId,
    type,
    origin: {
      yardId: booking.yard._id,
      name: booking.yard.name,
      address: booking.yard.address,
      location: booking.yard.location,
    },
    destination,
    scheduledDate: scheduledDateTime,
    scheduledTime,
    priority: 5, // Default priority
    pricing: {
      basePrice: launchFee,
      totalAmount,
      currency: 'AED',
    },
    notes,
    status: 'scheduled',
  });

  // Add to priority queue (MinHeap sorted by scheduledTime) - O(log n)
  deliveryQueue.push({
    id: delivery._id.toString(),
    scheduledTime: scheduledDateTime.getTime(),
    priority: delivery.priority,
    deliveryRef: delivery.deliveryRef,
  });

  // Find nearest available driver using GeoHash index
  const nearbyDrivers = driverGeoIndex.findKNearest(
    booking.yard.location.coordinates[1],
    booking.yard.location.coordinates[0],
    5
  );

  // TODO: Auto-assign nearest driver and notify them

  // Update boat status
  await Boat.findByIdAndUpdate(boatId, { status: 'in_transit' });

  res.status(201).json({
    success: true,
    message: 'Delivery scheduled successfully',
    data: {
      delivery,
      estimatedPickup: scheduledTime,
      pricing: { launchFee, totalAmount, currency: 'AED' },
      availableDrivers: nearbyDrivers.length,
      popularMarinas: POPULAR_MARINAS.slice(0, 5),
    }
  });
});

// @desc    Get popular marinas list
// @route   GET /api/v1/delivery/marinas
// @access  Private
exports.getMarinas = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    count: POPULAR_MARINAS.length,
    data: POPULAR_MARINAS,
  });
});

// @desc    Track delivery in real-time
// @route   GET /api/v1/delivery/:id/track
// @access  Private
exports.trackDelivery = asyncHandler(async (req, res, next) => {
  const delivery = await Delivery.findOne({
    _id: req.params.id,
    user: req.user._id,
  })
  .populate('driver', 'name phone avatar captainProfile.rating')
  .populate('boat', 'name type dimensions.lengthFt primaryPhoto')
  .lean();

  if (!delivery) return next(new AppError('Delivery not found', 404));

  const statusMessages = {
    scheduled: 'Your delivery is scheduled',
    driver_assigned: `Driver ${delivery.driver?.name} has been assigned`,
    en_route_to_yard: 'Driver is heading to the yard',
    at_yard: 'Driver has arrived at the yard',
    loading: 'Your boat is being loaded',
    in_transit: 'Your boat is on the way!',
    approaching_destination: 'Almost there!',
    arrived: 'Arrived at destination',
    unloaded: 'Your boat has been unloaded',
    completed: 'Delivery completed',
  };

  res.status(200).json({
    success: true,
    data: {
      ...delivery,
      statusMessage: statusMessages[delivery.status] || delivery.status,
      // Real-time updates come via Socket.io subscription
      socketEvent: `delivery:${delivery._id}`,
      websocketRoom: `delivery_${delivery._id}`,
    }
  });
});

// @desc    Update driver GPS location (called by driver app)
// @route   POST /api/v1/delivery/:id/location
// @access  Private (driver role)
exports.updateDriverLocation = asyncHandler(async (req, res, next) => {
  const { lat, lng, speed = 0, heading = 0 } = req.body;

  const delivery = await Delivery.findOne({
    _id: req.params.id,
    driver: req.user._id,
    status: { $in: ['en_route_to_yard', 'at_yard', 'loading', 'in_transit', 'approaching_destination'] },
  });

  if (!delivery) return next(new AppError('Active delivery not found', 404));

  // Update driver position in GeoHash index - O(1)
  driverGeoIndex.delete(req.user._id.toString(), delivery.currentLocation?.lat || lat, delivery.currentLocation?.lng || lng);
  driverGeoIndex.insert(req.user._id.toString(), lat, lng, { deliveryId: delivery._id, status: delivery.status });

  // Add GPS point (CircularBuffer concept - capped at 200 in model)
  delivery.addGpsPoint(lat, lng, speed, heading);
  await delivery.save();

  // Broadcast to user in real-time via Socket.io
  const io = getIO();
  io.to(`delivery_${delivery._id}`).emit('location_update', {
    deliveryId: delivery._id,
    lat, lng, speed, heading,
    timestamp: new Date().toISOString(),
    eta: delivery.currentLocation.eta,
  });

  res.status(200).json({ success: true, message: 'Location updated' });
});

// @desc    Update delivery status (driver)
// @route   PUT /api/v1/delivery/:id/status
// @access  Private (driver)
exports.updateDeliveryStatus = asyncHandler(async (req, res, next) => {
  const { status, note, lat, lng } = req.body;

  const validTransitions = {
    scheduled: ['driver_assigned', 'cancelled'],
    driver_assigned: ['en_route_to_yard', 'cancelled'],
    en_route_to_yard: ['at_yard'],
    at_yard: ['loading'],
    loading: ['in_transit'],
    in_transit: ['approaching_destination'],
    approaching_destination: ['arrived'],
    arrived: ['unloaded'],
    unloaded: ['completed'],
  };

  const delivery = await Delivery.findOne({
    _id: req.params.id,
    $or: [{ driver: req.user._id }, { user: req.user._id }]
  });

  if (!delivery) return next(new AppError('Delivery not found', 404));

  const allowed = validTransitions[delivery.status] || [];
  if (!allowed.includes(status)) {
    return next(new AppError(`Cannot transition from '${delivery.status}' to '${status}'`, 400));
  }

  delivery.updateStatus(status, lat && lng ? { lat, lng } : null, note);
  await delivery.save();

  // If completed, update boat status
  if (status === 'completed') {
    await Boat.findByIdAndUpdate(delivery.boat, { status: 'in_water' });
  }

  // Notify user via Socket.io
  const io = getIO();
  io.to(`user_${delivery.user}`).emit('delivery_status', {
    deliveryId: delivery._id,
    deliveryRef: delivery.deliveryRef,
    status,
    message: note || `Status updated to ${status}`,
    timestamp: new Date().toISOString(),
  });

  res.status(200).json({ success: true, data: delivery });
});

// @desc    Get user's delivery history
// @route   GET /api/v1/delivery/history
// @access  Private
exports.getDeliveryHistory = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, status } = req.query;
  const query = { user: req.user._id };
  if (status) query.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [deliveries, total] = await Promise.all([
    Delivery.find(query)
      .populate('boat', 'name type primaryPhoto dimensions.lengthFt')
      .populate('driver', 'name phone avatar')
      .select('-gpsTrail') // Exclude large GPS array in list view
      .sort('-createdAt').skip(skip).limit(parseInt(limit)).lean(),
    Delivery.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: deliveries.length,
    total,
    pages: Math.ceil(total / parseInt(limit)),
    data: deliveries,
  });
});

// @desc    Get upcoming scheduled deliveries (today's queue from MinHeap)
// @route   GET /api/v1/delivery/queue
// @access  Private (admin, driver)
exports.getDeliveryQueue = asyncHandler(async (req, res, next) => {
  // Peek at priority queue without modifying it
  const queueSnapshot = [];
  const tempQueue = [];

  // O(k log n) to extract top k
  while (!deliveryQueue.isEmpty() && queueSnapshot.length < 20) {
    const item = deliveryQueue.pop();
    const scheduledTime = new Date(item.scheduledTime);
    const isToday = scheduledTime.toDateString() === new Date().toDateString();

    if (isToday || scheduledTime > new Date()) {
      queueSnapshot.push(item);
    }
    tempQueue.push(item);
  }

  // Restore queue
  tempQueue.forEach(item => deliveryQueue.push(item));

  res.status(200).json({
    success: true,
    count: queueSnapshot.length,
    data: queueSnapshot,
  });
});
