const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    match: [/^\+?[1-9]\d{7,14}$/, 'Please enter a valid phone number'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false,
  },
  passwordChangedAt: Date,
  role: {
    type: String,
    enum: ['user', 'captain', 'driver', 'yard_staff', 'admin', 'super_admin'],
    default: 'user',
  },
  avatar: {
    type: String,
    default: null,
  },
  emiratesId: {
    type: String,
    select: false,
  },
  isActive: { type: Boolean, default: true },
  isEmailVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
  isKycVerified: { type: Boolean, default: false },

  // OTP fields
  otpHash: { type: String, select: false },
  otpExpiry: { type: Date, select: false },
  otpAttempts: { type: Number, default: 0, select: false },

  // Refresh tokens (array for multi-device)
  refreshTokens: [{
    token: String,
    deviceId: String,
    deviceName: String,
    createdAt: { type: Date, default: Date.now },
    expiresAt: Date,
  }],

  // Subscription & Wallet
  subscription: {
    plan: { type: String, enum: ['free', 'basic', 'premium', 'elite'], default: 'free' },
    startDate: Date,
    endDate: Date,
    autoRenew: { type: Boolean, default: true },
  },
  walletBalance: { type: Number, default: 0, min: 0 },
  loyaltyPoints: { type: Number, default: 0 },

  // Preferences
  preferences: {
    theme: { type: String, enum: ['deep_ocean', 'pearl_harbor', 'midnight_marina'], default: 'deep_ocean' },
    language: { type: String, default: 'en' },
    currency: { type: String, default: 'AED' },
    notifications: {
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      deliveryUpdates: { type: Boolean, default: true },
      bookingReminders: { type: Boolean, default: true },
      promotions: { type: Boolean, default: false },
      weatherAlerts: { type: Boolean, default: true },
    },
    measurementUnit: { type: String, enum: ['feet', 'meters'], default: 'feet' },
  },

  // Push notification token
  fcmTokens: [{ type: String }],

  // Address
  address: {
    street: String,
    area: String,
    emirate: String,
    country: { type: String, default: 'UAE' },
  },

  // Security
  loginAttempts: { type: Number, default: 0, select: false },
  lockUntil: { type: Date, select: false },
  lastLogin: Date,
  lastLoginIp: { type: String, select: false },
  twoFactorEnabled: { type: Boolean, default: false },

  // Stats
  totalBookings: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Captain specific fields
  captainProfile: {
    licenseNumber: String,
    licenseExpiry: Date,
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalTrips: { type: Number, default: 0 },
    bio: String,
    isAvailable: { type: Boolean, default: false },
    vessel: {
      name: { type: String },
      vesselType: { type: String },   // renamed from 'type' — avoids Mongoose reserved key conflict
      capacity: { type: Number },
      length: { type: Number },
    },
  },

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// ============================================================
// INDEXES for fast queries (role, subscription, createdAt only —
// email/phone/referralCode are already indexed via `unique:true` in schema)
// ============================================================
userSchema.index({ role: 1 });
userSchema.index({ 'subscription.plan': 1 });
userSchema.index({ createdAt: -1 });

// ============================================================
// VIRTUALS
// ============================================================
userSchema.virtual('boats', {
  ref: 'Boat',
  localField: '_id',
  foreignField: 'owner',
});

userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// ============================================================
// PRE-SAVE HOOKS
// ============================================================
userSchema.pre('save', async function(next) {
  // Hash password only if modified
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  if (!this.isNew) this.passwordChangedAt = new Date();
  next();
});

// Generate unique referral code on creation
userSchema.pre('save', function(next) {
  if (this.isNew && !this.referralCode) {
    this.referralCode = `PL${this._id.toString().slice(-6).toUpperCase()}`;
  }
  next();
});

// ============================================================
// INSTANCE METHODS
// ============================================================
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.incrementLoginAttempts = async function() {
  // Unlock if lock has expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({ $set: { loginAttempts: 1 }, $unset: { lockUntil: 1 } });
  }
  const updates = { $inc: { loginAttempts: 1 } };
  // Lock after 5 attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: new Date(Date.now() + 2 * 60 * 60 * 1000) };
  }
  return this.updateOne(updates);
};

userSchema.methods.addLoyaltyPoints = function(points) {
  this.loyaltyPoints += points;
  return this.save({ validateBeforeSave: false });
};

// ============================================================
// STATIC METHODS
// ============================================================
userSchema.statics.findByCredentials = async function(email, password) {
  const user = await this.findOne({ email, isActive: true }).select('+password +loginAttempts +lockUntil');
  if (!user) return null;
  if (user.isLocked) throw new Error('Account temporarily locked due to too many failed login attempts.');
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    await user.incrementLoginAttempts();
    return null;
  }
  // Reset login attempts on success
  await user.updateOne({ $set: { loginAttempts: 0, lastLogin: new Date() }, $unset: { lockUntil: 1 } });
  return user;
};

module.exports = mongoose.model('User', userSchema);
