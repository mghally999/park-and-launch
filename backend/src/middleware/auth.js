const { verifyAccessToken } = require('../utils/jwt');
const { AppError, asyncHandler } = require('./errorHandler');
const { userSessionCache } = require('../utils/dataStructures');
const User = require('../models/User');

/**
 * Protect routes - verifies JWT, uses LRU cache for fast session lookups
 * Cache hit: O(1) | Cache miss: O(1) DB lookup
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Extract token from header or cookie
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return next(new AppError('Access denied. No token provided.', 401));
  }

  // Verify JWT
  const decoded = verifyAccessToken(token);

  // O(1) cache lookup first
  let user = userSessionCache.get(decoded.id);

  if (!user) {
    // Cache miss - fetch from DB
    user = await User.findById(decoded.id).select('-password -otpHash -refreshTokens').lean();
    if (!user) return next(new AppError('User no longer exists.', 401));
    if (!user.isActive) return next(new AppError('Account has been deactivated.', 403));

    // Repopulate cache
    userSessionCache.put(decoded.id, user);
  }

  // Check if password was changed after token was issued
  if (user.passwordChangedAt) {
    const changedAt = Math.floor(new Date(user.passwordChangedAt).getTime() / 1000);
    if (decoded.iat < changedAt) {
      return next(new AppError('Password recently changed. Please log in again.', 401));
    }
  }

  req.user = user;
  next();
});

/**
 * Role-based access control
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError(`Role '${req.user.role}' is not authorized for this action.`, 403));
    }
    next();
  };
};

/**
 * Verify phone (for OTP-protected actions)
 */
const requireVerifiedPhone = (req, res, next) => {
  if (!req.user.isPhoneVerified) {
    return next(new AppError('Phone verification required for this action.', 403));
  }
  next();
};

module.exports = { protect, authorize, requireVerifiedPhone };
