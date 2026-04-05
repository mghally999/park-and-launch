const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  deliveryRef: { type: String, unique: true, uppercase: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  boat: { type: mongoose.Schema.Types.ObjectId, ref: 'Boat', required: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  parkingBooking: { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingBooking' },

  type: {
    type: String,
    enum: ['yard_to_slipway', 'slipway_to_yard', 'yard_to_marina', 'marina_to_yard'],
    required: true,
  },

  // Origin
  origin: {
    yardId: { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingYard' },
    name: String,
    address: String,
    location: {
      type: { type: String, default: 'Point' },
      coordinates: [Number],
    },
  },

  // Destination
  destination: {
    type: { type: String, enum: ['slipway', 'marina', 'yard', 'custom'], default: 'slipway' },
    name: String,
    address: String,
    marinaPier: String,
    location: {
      type: { type: String, default: 'Point' },
      coordinates: [Number],
    },
  },

  // Scheduling
  scheduledDate: { type: Date, required: true },
  scheduledTime: { type: String, required: true }, // "HH:MM"
  priority: { type: Number, default: 5 }, // 1=highest, 10=lowest (for MinHeap)

  // Status
  status: {
    type: String,
    enum: [
      'scheduled',
      'driver_assigned',
      'en_route_to_yard',
      'at_yard',
      'loading',
      'in_transit',
      'approaching_destination',
      'arrived',
      'unloaded',
      'completed',
      'cancelled',
      'failed',
    ],
    default: 'scheduled',
    index: true,
  },

  // Real-time GPS tracking (CircularBuffer concept - last 100 coordinates stored)
  gpsTrail: [{
    lat: Number,
    lng: Number,
    speed: Number, // km/h
    heading: Number, // degrees
    timestamp: { type: Date, default: Date.now },
  }],

  // Current position (updated in real-time via Socket.io)
  currentLocation: {
    lat: Number,
    lng: Number,
    updatedAt: Date,
    speed: Number,
    heading: Number,
    eta: Date, // Dynamic ETA calculated via routing
  },

  // Route
  estimatedRoute: {
    distanceKm: Number,
    durationMins: Number,
    polyline: String, // Encoded Google Maps polyline
  },

  // Condition documentation (for insurance)
  preDeliveryCondition: {
    photos: [String],
    condition: { type: String, enum: ['excellent', 'good', 'fair', 'poor'] },
    notes: String,
    checkedAt: Date,
    checkedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  postDeliveryCondition: {
    photos: [String],
    condition: { type: String, enum: ['excellent', 'good', 'fair', 'poor'] },
    notes: String,
    checkedAt: Date,
    checkedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },

  // Pricing
  pricing: {
    basePrice: Number,
    distanceSurcharge: Number,
    peakHourSurcharge: Number,
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: 'AED' },
    isPaid: { type: Boolean, default: false },
  },

  // Completion
  completedAt: Date,
  driverSignature: String,
  userSignature: String,
  userConfirmed: { type: Boolean, default: false },

  // Timestamps for each status change
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    location: { lat: Number, lng: Number },
    note: String,
  }],

  notes: String,
  cancellationReason: String,

}, { timestamps: true });

deliverySchema.index({ user: 1, status: 1 });
deliverySchema.index({ driver: 1, status: 1 });
deliverySchema.index({ scheduledDate: 1, priority: 1 });
deliverySchema.index({ 'origin.location': '2dsphere' });
deliverySchema.index({ 'destination.location': '2dsphere' });

deliverySchema.pre('save', function(next) {
  if (this.isNew) {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substr(2, 4).toUpperCase();
    this.deliveryRef = `DLV${ts}${rand}`;
  }
  // Keep GPS trail at max 200 points (memory management)
  if (this.gpsTrail.length > 200) {
    this.gpsTrail = this.gpsTrail.slice(-200);
  }
  next();
});

// Methods
deliverySchema.methods.addGpsPoint = function(lat, lng, speed = 0, heading = 0) {
  this.gpsTrail.push({ lat, lng, speed, heading, timestamp: new Date() });
  if (this.gpsTrail.length > 200) this.gpsTrail.shift();
  this.currentLocation = { lat, lng, speed, heading, updatedAt: new Date() };
};

deliverySchema.methods.updateStatus = function(status, location = null, note = '') {
  this.status = status;
  this.statusHistory.push({ status, timestamp: new Date(), location, note });
  if (status === 'completed') this.completedAt = new Date();
};

module.exports = mongoose.model('Delivery', deliverySchema);
