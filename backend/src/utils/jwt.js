const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { userSessionCache } = require('./dataStructures');

/**
 * Generate access token (short-lived)
 */
const generateAccessToken = (userId, role = 'user') => {
  return jwt.sign(
    { id: userId, role, type: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

/**
 * Generate refresh token (long-lived, stored in DB)
 */
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId, type: 'refresh', jti: crypto.randomUUID() },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
  );
};

/**
 * Verify access token
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Verify refresh token
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

/**
 * Send token response with HttpOnly cookies
 */
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  // Cache session in LRU cache for fast auth checks - O(1)
  userSessionCache.put(user._id.toString(), {
    id: user._id,
    role: user.role,
    email: user.email,
    isActive: user.isActive,
  });

  const cookieOptions = {
    expires: new Date(Date.now() + parseInt(process.env.COOKIE_EXPIRE || 7) * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  };

  res.cookie('refreshToken', refreshToken, cookieOptions);

  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatar: user.avatar,
    theme: user.preferences?.theme || 'deep_ocean',
    isVerified: user.isVerified,
  };

  res.status(statusCode).json({
    success: true,
    message,
    accessToken,
    user: userResponse,
  });
};

/**
 * Generate OTP (6-digit)
 */
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Hash OTP for storage
 */
const hashOTP = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  sendTokenResponse,
  generateOTP,
  hashOTP,
};
