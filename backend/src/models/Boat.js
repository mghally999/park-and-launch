const mongoose = require('mongoose');

const boatSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Boat name is required'],
    trim: true,
    maxlength: [60, 'Boat name cannot exceed 60 characters'],
  },
  registrationNumber: {
    type: String,
    required: [true, 'Registration number is required'],
    unique: true,
    sparse: true,
    uppercase: true,
    trim: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['speedboat', 'yacht', 'fishing_boat', 'sailboat', 'catamaran', 'jetski', 'pontoon', 'bass_boat', 'dhow', 'tender', 'other'],
  },
  make: { type: String, trim: true },
  model: { type: String, trim: true },
  year: {
    type: Number,
    min: [1960, 'Year must be after 1960'],
    max: [new Date().getFullYear() + 1, 'Invalid year'],
  },
  color: { type: String, trim: true },
  
  // Dimensions
  dimensions: {
    lengthFt: { type: Number, required: [true, 'Length in feet is required'], min: 5, max: 200 },
    beamFt: { type: Number }, // Width
    draftFt: { type: Number }, // Depth below waterline
    weightKg: { type: Number },
  },

  // Engine
  engine: {
    make: String,
    horsepower: Number,
    fuelType: { type: String, enum: ['gasoline', 'diesel', 'electric', 'hybrid'] },
    numberOfEngines: { type: Number, default: 1 },
  },

  // Capacity
  capacity: {
    passengers: { type: Number, default: 6 },
    fuelLiters: Number,
    waterLiters: Number,
  },

  // Media
  photos: [{ type: String }], // S3 URLs
  primaryPhoto: { type: String },
  trailerPhoto: { type: String }, // Photo of boat on trailer

  // Documents
  documents: {
    registrationDoc: String,
    insuranceDoc: String,
    inspectionDoc: String,
    insuranceExpiry: Date,
    registrationExpiry: Date,
  },

  // Status
  status: {
    type: String,
    enum: ['in_yard', 'in_water', 'in_transit', 'maintenance', 'charter_available', 'sold'],
    default: 'in_water',
  },

  // Current parking
  currentParking: {
    spot: { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingSpot' },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingBooking' },
    parkedSince: Date,
    spotNumber: String,
    yardName: String,
    cameraFeedUrl: String,
    cameraId: String,
    lastConditionPhoto: String,
    lastConditionDate: Date,
  },

  // Charter settings
  charter: {
    isAvailable: { type: Boolean, default: false },
    pricePerHour: Number,
    pricePerDay: Number,
    minimumHours: { type: Number, default: 4 },
    features: [String],
    rules: String,
    totalEarnings: { type: Number, default: 0 },
  },

  // Maintenance log
  maintenanceLog: [{
    date: { type: Date, default: Date.now },
    type: String,
    description: String,
    cost: Number,
    performedBy: String,
  }],

  // Insurance
  insurance: {
    provider: String,
    policyNumber: String,
    expiryDate: Date,
    coverageAmount: Number,
  },

  // Value tracking
  estimatedValue: Number,
  purchasePrice: Number,
  purchaseDate: Date,

  // Condition reports
  conditionReports: [{
    date: { type: Date, default: Date.now },
    type: { type: String, enum: ['pre_tow', 'post_tow', 'yard_arrival', 'yard_departure', 'periodic'] },
    photos: [String],
    condition: { type: String, enum: ['excellent', 'good', 'fair', 'poor'] },
    notes: String,
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  }],

  // Fuel level (tracked by yard staff)
  fuelLevel: { type: Number, min: 0, max: 100, default: null },

  // Emergency contact for the vessel
  emergencyContact: {
    name: String,
    phone: String,
    relation: String,
  },

  isActive: { type: Boolean, default: true },
  isFeaturedCharter: { type: Boolean, default: false },

}, {
  timestamps: true,
  toJSON: { virtuals: true },
});

// Compound indexes (registrationNumber unique already set in schema)
boatSchema.index({ owner: 1, isActive: 1 });
boatSchema.index({ 'charter.isAvailable': 1, type: 1 });
boatSchema.index({ status: 1 });

// Virtual: price per foot per month (based on length)
boatSchema.virtual('pricePerFootPerMonth').get(function() {
  // Market rate calculation: 20-25 AED per foot
  return null; // Set by ParkingBooking based on yard pricing
});

// Virtual: monthly parking cost estimate
boatSchema.virtual('estimatedMonthlyParking').get(function() {
  const ratePerFoot = 22; // Average Park & Launch rate
  return Math.round(this.dimensions.lengthFt * ratePerFoot);
});

module.exports = mongoose.model('Boat', boatSchema);
