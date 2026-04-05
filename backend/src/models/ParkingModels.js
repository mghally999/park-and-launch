const mongoose = require('mongoose');

// ============================================================
// PARKING YARD SCHEMA
// ============================================================
const parkingYardSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, lowercase: true },
  description: String,
  emirate: {
    type: String,
    required: true,
    enum: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'],
  },
  area: { type: String, required: true },
  address: { type: String, required: true },

  // GeoJSON for MongoDB geospatial queries
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }, // [lng, lat]
  },

  // Capacity management
  totalSpots: { type: Number, required: true },
  availableSpots: { type: Number, required: true },

  // Dimensions
  maxBoatLengthFt: { type: Number, default: 60 },
  maxBoatBeamFt: { type: Number, default: 20 },
  maxBoatWeightKg: { type: Number, default: 10000 },

  // Pricing (AED per foot per month)
  pricing: {
    ratePerFootPerMonth: { type: Number, required: true },
    annualDiscountPercent: { type: Number, default: 15 },
    minimumLengthFt: { type: Number, default: 15 },
    launchFeePerTrip: { type: Number, default: 150 },
    storageOnly: Boolean,
  },

  // Services available at this yard
  services: {
    powerWash: { available: Boolean, priceAED: Number },
    antifoling: { available: Boolean, priceAED: Number },
    engineService: { available: Boolean },
    fuelFill: { available: Boolean, pricePerLiter: Number },
    cctv24h: { type: Boolean, default: true },
    security24h: { type: Boolean, default: true },
    wifi: Boolean,
    electricHookup: Boolean,
    freshwater: Boolean,
  },

  // Slipways connected to this yard
  slipways: [{
    name: String,
    location: {
      type: { type: String, default: 'Point' },
      coordinates: [Number],
    },
    maxLengthFt: Number,
    feeAED: Number,
    isOperational: Boolean,
    operatingHours: String,
    marinaName: String,
  }],

  // Operating hours
  operatingHours: {
    open: { type: String, default: '06:00' },
    close: { type: String, default: '22:00' },
    is24Hours: { type: Boolean, default: false },
  },

  // Media
  photos: [String],
  primaryPhoto: String,
  cameraFeeds: [{
    cameraId: String,
    label: String, // e.g., "Main Entrance", "Row A", "Row B"
    streamUrl: String,
    thumbnailUrl: String,
    isActive: Boolean,
  }],

  // Rating & reviews
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },

  // Staff contact
  contact: {
    phone: String,
    whatsapp: String,
    email: String,
  },

  managedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },

}, { timestamps: true });

parkingYardSchema.index({ location: '2dsphere' }); // Geospatial
parkingYardSchema.index({ emirate: 1, isActive: 1 });
parkingYardSchema.index({ 'pricing.ratePerFootPerMonth': 1 });
parkingYardSchema.index({ availableSpots: 1 });

// ============================================================
// PARKING BOOKING SCHEMA
// ============================================================
const parkingBookingSchema = new mongoose.Schema({
  bookingRef: {
    type: String,
    unique: true,
    uppercase: true,
    sparse: true,   // sparse prevents duplicate-key errors on null values
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  boat: { type: mongoose.Schema.Types.ObjectId, ref: 'Boat', required: true },
  yard: { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingYard', required: true },

  spotNumber: { type: String },
  spotRow: { type: String },

  // Plan type
  planType: {
    type: String,
    enum: ['monthly', 'quarterly', 'annual', 'daily'],
    required: true,
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },

  // Pricing snapshot at time of booking
  pricing: {
    boatLengthFt: { type: Number, required: true },
    ratePerFootPerMonth: { type: Number, required: true },
    baseMonthlyRate: { type: Number, required: true },
    discount: { type: Number, default: 0 }, // % discount
    discountReason: String,
    totalAmount: { type: Number, required: true },
    taxAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    currency: { type: String, default: 'AED' },
  },

  status: {
    type: String,
    enum: ['pending_payment', 'confirmed', 'active', 'expired', 'cancelled', 'suspended'],
    default: 'pending_payment',
    index: true,
  },

  payment: {
    paymentId: String,
    paymentMethod: String,
    paidAt: Date,
    refundedAt: Date,
    refundAmount: Number,
    refundReason: String,
  },

  // Auto-renewal
  autoRenew: { type: Boolean, default: true },
  nextRenewalDate: Date,
  renewalReminders: [{ sentAt: Date, channel: String }],

  // Notifications sent
  notifications: [{
    type: { type: String },
    sentAt: Date,
    message: String,
  }],

  // Cancellation
  cancellationDate: Date,
  cancellationReason: String,
  cancellationPolicy: String,

  notes: String,
  internalNotes: String,

}, { timestamps: true });

parkingBookingSchema.index({ user: 1, status: 1 });
parkingBookingSchema.index({ yard: 1, status: 1 });
parkingBookingSchema.index({ endDate: 1, autoRenew: 1 });
// bookingRef unique already enforced in field definition above

parkingBookingSchema.pre('save', function(next) {
  if (this.isNew) {
    const prefix = 'PL';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    this.bookingRef = `${prefix}${timestamp}${random}`;
  }
  next();
});

// Virtual: days remaining
parkingBookingSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  if (now > this.endDate) return 0;
  return Math.ceil((this.endDate - now) / (1000 * 60 * 60 * 24));
});

const ParkingYard = mongoose.model('ParkingYard', parkingYardSchema);
const ParkingBooking = mongoose.model('ParkingBooking', parkingBookingSchema);

module.exports = { ParkingYard, ParkingBooking };
