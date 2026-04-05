const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { Product, Order, Notification } = require('../models/OtherModels');
const { productSearchTrie, parkingSpotCache } = require('../utils/dataStructures');

// ============================================================
// MARKETPLACE CONTROLLER
// ============================================================

// Build product search Trie from DB (called at startup)
exports.buildProductTrie = async () => {
  const products = await Product.find({ isActive: true }).select('name category tags brand slug').lean();
  products.forEach(p => {
    productSearchTrie.insert(p.name, { id: p._id, slug: p.slug, category: p.category });
    p.tags?.forEach(tag => productSearchTrie.insert(tag, { id: p._id, slug: p.slug, category: p.category }));
    if (p.brand) productSearchTrie.insert(p.brand, { id: p._id, slug: p.slug, category: p.category });
  });
  console.log(`Product search Trie built with ${productSearchTrie.size} entries`);
};

// @desc    Get products with filters & Trie-powered search
// @route   GET /api/v1/marketplace/products
// @access  Public
exports.getProducts = asyncHandler(async (req, res, next) => {
  const { q, category, brand, minPrice, maxPrice, sort = '-soldCount', page = 1, limit = 20, inStock, featured } = req.query;

  // Trie autocomplete search - O(m) where m = query length
  if (q && q.length >= 2) {
    const suggestions = productSearchTrie.autocomplete(q, 10);
    if (req.query.autocomplete) {
      return res.status(200).json({ success: true, suggestions: suggestions.map(s => s.word) });
    }
  }

  let query = { isActive: true };
  if (category) query.category = category;
  if (brand) query.brand = new RegExp(brand, 'i');
  if (minPrice || maxPrice) query.price = {};
  if (minPrice) query.price.$gte = parseFloat(minPrice);
  if (maxPrice) query.price.$lte = parseFloat(maxPrice);
  if (inStock === 'true') query.stock = { $gt: 0 };
  if (featured === 'true') query.isFeatured = true;

  // Full-text search via MongoDB index
  if (q) query.$text = { $search: q };

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [products, total] = await Promise.all([
    Product.find(query).sort(sort).skip(skip).limit(parseInt(limit))
      .select('-reviews').lean(),
    Product.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    pages: Math.ceil(total / parseInt(limit)),
    data: products,
  });
});

// @desc    Get product categories
// @route   GET /api/v1/marketplace/categories
// @access  Public
exports.getCategories = asyncHandler(async (req, res, next) => {
  const categories = await Product.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$category', count: { $sum: 1 }, minPrice: { $min: '$price' }, maxPrice: { $max: '$price' } } },
    { $sort: { count: -1 } },
  ]);
  res.status(200).json({ success: true, data: categories });
});

// @desc    Get single product
// @route   GET /api/v1/marketplace/products/:id
// @access  Public
exports.getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { $inc: { viewCount: 1 } },
    { new: true }
  ).populate('reviews.user', 'name avatar').lean();

  if (!product) return next(new AppError('Product not found', 404));
  res.status(200).json({ success: true, data: product });
});

// @desc    Create order
// @route   POST /api/v1/marketplace/orders
// @access  Private
exports.createOrder = asyncHandler(async (req, res, next) => {
  const { items, deliveryAddress, deliverToMarina, promoCode } = req.body;

  if (!items?.length) return next(new AppError('No items in order', 400));

  // Validate stock and build order items
  const orderItems = [];
  let subtotal = 0;

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product || !product.isActive) return next(new AppError(`Product ${item.productId} not found`, 404));
    if (product.stock < item.quantity && !product.allowBackorder) {
      return next(new AppError(`Insufficient stock for ${product.name}. Available: ${product.stock}`, 400));
    }
    const lineTotal = product.price * item.quantity;
    subtotal += lineTotal;
    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.primaryImage,
      quantity: item.quantity,
      unitPrice: product.price,
      variant: item.variant,
      subtotal: lineTotal,
    });
    // Decrement stock atomically
    await Product.findByIdAndUpdate(product._id, { $inc: { stock: -item.quantity, soldCount: item.quantity } });
  }

  const shippingFee = subtotal > 500 ? 0 : 25;
  let discount = 0;
  let promoCodeUsed = null;
  // TODO: Validate promo code from PromoCode collection
  const taxAmount = Math.round((subtotal - discount) * 0.05);
  const totalAmount = subtotal + shippingFee - discount + taxAmount;

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    deliveryAddress,
    deliverToMarina,
    pricing: { subtotal, shippingFee, discount, promoCode: promoCodeUsed, taxAmount, totalAmount, currency: 'AED' },
    status: 'pending',
  });

  res.status(201).json({ success: true, message: 'Order placed successfully', data: order });
});

// @desc    Get user orders
// @route   GET /api/v1/marketplace/orders
// @access  Private
exports.getMyOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id })
    .sort('-createdAt').limit(50).lean();
  res.status(200).json({ success: true, count: orders.length, data: orders });
});

// @desc    Add product review
// @route   POST /api/v1/marketplace/products/:id/review
// @access  Private
exports.addReview = asyncHandler(async (req, res, next) => {
  const { rating, title, body } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) return next(new AppError('Product not found', 404));

  // Check if already reviewed
  const existing = product.reviews.find(r => r.user.toString() === req.user._id.toString());
  if (existing) return next(new AppError('You have already reviewed this product', 409));

  product.reviews.push({ user: req.user._id, rating, title, body, isVerifiedPurchase: false });
  // Recalculate average rating
  const avg = product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length;
  product.rating = Math.round(avg * 10) / 10;
  product.reviewCount = product.reviews.length;
  await product.save();

  res.status(201).json({ success: true, message: 'Review added' });
});
