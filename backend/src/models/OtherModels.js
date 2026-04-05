const mongoose = require('mongoose');

// ============================================================
// CHARTER BOOKING
// ============================================================
const charterBookingSchema = new mongoose.Schema({
  bookingRef: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  captain: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  boat: { type: mongoose.Schema.Types.ObjectId, ref: 'Boat' },

  type: {
    type: String,
    enum: ['fishing', 'leisure_cruise', 'sunset_cruise', 'island_hopping', 'water_sports', 'private_charter', 'corporate'],
    required: true,
  },

  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  durationHours: { type: Number, required: true, min: 2 },

  // Departure marina
  departureMarina: {
    name: String,
    location: {
      type: { type: String, default: 'Point' },
      coordinates: [Number],
    },
    pier: String,
  },

  passengers: {
    adults: { type: Number, required: true, min: 1 },
    children: { type: Number, default: 0 },
    totalCount: Number,
  },

  // Add-ons ordered
  addOns: [{
    item: String,
    quantity: Number,
    price: Number,
  }],

  // Fishing equipment
  fishingEquipment: [{
    item: String,
    quantity: Number,
    price: Number,
  }],

  bait: [{
    type: String,
    quantity: Number,
    price: Number,
  }],

  pricing: {
    basePrice: Number,
    addOnsTotal: Number,
    equipmentTotal: Number,
    serviceFee: Number, // Platform fee
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: 'AED' },
    depositPaid: { type: Number, default: 0 },
    balanceDue: Number,
  },

  status: {
    type: String,
    enum: ['pending', 'confirmed', 'captain_assigned', 'in_progress', 'completed', 'cancelled', 'no_show'],
    default: 'pending',
  },

  // Real-time tracking
  currentLocation: {
    lat: Number,
    lng: Number,
    updatedAt: Date,
  },

  gpsTrail: [{
    lat: Number,
    lng: Number,
    timestamp: Date,
  }],

  // Post-trip
  captainRating: { type: Number, min: 1, max: 5 },
  userRating: { type: Number, min: 1, max: 5 },
  review: String,
  captainReview: String,

  catch: [{
    species: String,
    weightKg: Number,
    quantity: Number,
    photo: String,
  }],

  photos: [String],

  payment: {
    depositPaidAt: Date,
    fullyPaidAt: Date,
    paymentMethod: String,
    paymentId: String,
    refundedAt: Date,
    refundAmount: Number,
  },

  cancellationReason: String,
  specialRequests: String,

}, { timestamps: true });

charterBookingSchema.index({ user: 1, status: 1 });
charterBookingSchema.index({ captain: 1, date: 1 });
charterBookingSchema.index({ date: 1, type: 1 });

charterBookingSchema.pre('save', function(next) {
  if (this.isNew) {
    const ts = Date.now().toString(36).toUpperCase();
    this.bookingRef = `CHT${ts}`;
    this.passengers.totalCount = (this.passengers.adults || 0) + (this.passengers.children || 0);
  }
  if (this.gpsTrail.length > 500) this.gpsTrail = this.gpsTrail.slice(-500);
  next();
});

// ============================================================
// PRODUCT (Marketplace)
// ============================================================
const productSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true, trim: true },
  slug: String,
  description: { type: String, required: true },
  shortDescription: String,
  sku: { type: String, unique: true, sparse: true },

  category: {
    type: String,
    required: true,
    enum: [
      'engine_parts', 'electrical', 'navigation', 'safety', 'deck_hardware',
      'anchoring', 'ropes_lines', 'fishing_equipment', 'bait', 'cleaning_supplies',
      'covers_canvas', 'electronics', 'tools', 'clothing_accessories',
      'fuel_additives', 'trailer_parts', 'fenders', 'life_jackets', 'other',
    ],
  },
  subcategory: String,
  brand: String,
  compatibleWith: [String], // Boat types/models

  // Pricing
  price: { type: Number, required: true, min: 0 },
  compareAtPrice: Number, // Original price for showing discount
  currency: { type: String, default: 'AED' },
  taxRate: { type: Number, default: 5 }, // 5% VAT in UAE

  // Inventory
  stock: { type: Number, required: true, default: 0, min: 0 },
  lowStockThreshold: { type: Number, default: 5 },
  trackInventory: { type: Boolean, default: true },
  allowBackorder: { type: Boolean, default: false },

  // Variants (e.g., size, color)
  variants: [{
    name: String,
    options: [String],
    priceDiff: Number,
    stock: Number,
  }],

  // Media
  images: [String],
  primaryImage: String,
  video: String,

  // Ratings
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  reviews: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    title: String,
    body: String,
    photos: [String],
    isVerifiedPurchase: Boolean,
    createdAt: { type: Date, default: Date.now },
  }],

  // SEO & Search
  tags: [String],
  searchKeywords: [String],

  // Shipping
  weight: Number, // kg
  dimensions: { length: Number, width: Number, height: Number }, // cm
  shippingFee: { type: Number, default: 0 },
  isFreeShipping: Boolean,
  deliveryDays: { type: Number, default: 2 },

  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  isOnSale: { type: Boolean, default: false },
  soldCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 },

}, { timestamps: true });

productSchema.index({ name: 'text', description: 'text', tags: 'text' }); // Full-text search
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ soldCount: -1 });

// ============================================================
// ORDER
// ============================================================
const orderSchema = new mongoose.Schema({
  orderRef: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String, // Snapshot
    image: String,
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
    variant: String,
    subtotal: Number,
  }],

  // Delivery address
  deliveryAddress: {
    name: String,
    phone: String,
    street: String,
    area: String,
    emirate: String,
    notes: String,
    location: { type: { type: String, default: 'Point' }, coordinates: [Number] },
  },

  // Or deliver to marina/yard
  deliverToMarina: String,

  pricing: {
    subtotal: Number,
    shippingFee: Number,
    discount: Number,
    promoCode: String,
    taxAmount: Number,
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: 'AED' },
  },

  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'],
    default: 'pending',
    index: true,
  },

  payment: {
    method: String,
    paymentId: String,
    paidAt: Date,
    status: { type: String, default: 'pending' },
  },

  trackingNumber: String,
  estimatedDelivery: Date,
  deliveredAt: Date,

  statusHistory: [{ status: String, timestamp: { type: Date, default: Date.now }, note: String }],
  notes: String,
  cancellationReason: String,

}, { timestamps: true });

orderSchema.pre('save', function(next) {
  if (this.isNew) {
    const ts = Date.now().toString(36).toUpperCase();
    this.orderRef = `ORD${ts}`;
    // Calculate subtotals
    this.items.forEach(item => { item.subtotal = item.quantity * item.unitPrice; });
  }
  next();
});

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

// ============================================================
// NOTIFICATION
// ============================================================
const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: {
    type: String,
    enum: [
      'booking_confirmed', 'booking_expiring', 'booking_expired',
      'delivery_scheduled', 'delivery_started', 'delivery_arrived',
      'charter_confirmed', 'charter_reminder', 'trip_started',
      'order_shipped', 'order_delivered',
      'payment_received', 'payment_failed',
      'weather_alert', 'tide_alert',
      'boat_parked_1month', 'boat_condition_update',
      'camera_alert', 'security_alert',
      'promotion', 'system',
    ],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: mongoose.Schema.Types.Mixed, // Extra payload
  isRead: { type: Boolean, default: false, index: true },
  readAt: Date,
  channel: { type: String, enum: ['push', 'sms', 'email', 'in_app'], default: 'in_app' },
  priority: { type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' },
  expiresAt: Date,
  imageUrl: String,
  actionUrl: String, // Deep link
}, { timestamps: true });

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // Auto-delete after 90 days

const CharterBooking = mongoose.model('CharterBooking', charterBookingSchema);
const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);
const Notification = mongoose.model('Notification', notificationSchema);

module.exports = { CharterBooking, Product, Order, Notification };
