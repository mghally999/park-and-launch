const { asyncHandler, AppError } = require('../middleware/errorHandler');
const User = require('../models/User');
const { sendTokenResponse, generateOTP, hashOTP, verifyRefreshToken, generateAccessToken } = require('../utils/jwt');
const { userSessionCache } = require('../utils/dataStructures');

// @desc    Register new user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, phone, password, role } = req.body;

  // Prevent self-assigning privileged roles
  const allowedRoles = ['user', 'captain'];
  const userRole = allowedRoles.includes(role) ? role : 'user';

  const user = await User.create({ name, email, phone, password, role: userRole });

  // Generate and send OTP for phone verification
  const otp = generateOTP();
  user.otpHash = hashOTP(otp);
  user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  await user.save({ validateBeforeSave: false });

  // TODO: Send OTP via Twilio SMS
  // await twilioClient.messages.create({ body: `Your Park & Launch OTP: ${otp}`, from: process.env.TWILIO_PHONE_NUMBER, to: phone });
  console.log(`OTP for ${phone}: ${otp}`); // Remove in production

  sendTokenResponse(user, 201, res, 'Registration successful. Please verify your phone.');
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password, deviceId, deviceName } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  const user = await User.findByCredentials(email, password);
  if (!user) {
    return next(new AppError('Invalid email or password', 401));
  }

  // Track device
  if (deviceId) {
    const existingDevice = user.refreshTokens.find(t => t.deviceId === deviceId);
    if (!existingDevice) {
      user.refreshTokens.push({
        token: 'pending',
        deviceId,
        deviceName: deviceName || 'Unknown Device',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
      await user.save({ validateBeforeSave: false });
    }
  }

  sendTokenResponse(user, 200, res, 'Login successful');
});

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  // Invalidate session cache
  userSessionCache.delete(req.user._id.toString());

  // Remove refresh token from DB
  await User.findByIdAndUpdate(req.user._id, {
    $pull: { refreshTokens: { deviceId: req.body.deviceId } }
  });

  res.cookie('refreshToken', '', { httpOnly: true, expires: new Date(0) });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// @desc    Verify OTP
// @route   POST /api/v1/auth/verify-otp
// @access  Private
exports.verifyOTP = asyncHandler(async (req, res, next) => {
  const { otp } = req.body;
  const user = await User.findById(req.user._id).select('+otpHash +otpExpiry +otpAttempts');

  if (!user.otpHash || !user.otpExpiry) {
    return next(new AppError('No OTP pending. Please request a new one.', 400));
  }

  if (user.otpExpiry < new Date()) {
    return next(new AppError('OTP has expired. Please request a new one.', 400));
  }

  if (user.otpAttempts >= 5) {
    return next(new AppError('Too many failed OTP attempts. Account temporarily locked.', 429));
  }

  const hashedOTP = hashOTP(otp);
  if (hashedOTP !== user.otpHash) {
    user.otpAttempts += 1;
    await user.save({ validateBeforeSave: false });
    return next(new AppError(`Invalid OTP. ${5 - user.otpAttempts} attempts remaining.`, 400));
  }

  // OTP verified
  user.isPhoneVerified = true;
  user.otpHash = undefined;
  user.otpExpiry = undefined;
  user.otpAttempts = 0;
  await user.save({ validateBeforeSave: false });

  // Invalidate cache to refresh user data
  userSessionCache.delete(req.user._id.toString());

  res.status(200).json({ success: true, message: 'Phone number verified successfully' });
});

// @desc    Resend OTP
// @route   POST /api/v1/auth/resend-otp
// @access  Private
exports.resendOTP = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('+otpHash +otpExpiry +otpAttempts');

  // Rate limit OTP resend
  if (user.otpExpiry && user.otpExpiry > new Date(Date.now() - 60000)) {
    return next(new AppError('Please wait 1 minute before requesting a new OTP.', 429));
  }

  const otp = generateOTP();
  user.otpHash = hashOTP(otp);
  user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  user.otpAttempts = 0;
  await user.save({ validateBeforeSave: false });

  // TODO: Send via Twilio
  console.log(`New OTP for ${user.phone}: ${otp}`);

  res.status(200).json({ success: true, message: 'OTP sent to your registered phone number' });
});

// @desc    Refresh access token
// @route   POST /api/v1/auth/refresh-token
// @access  Public (requires refresh token cookie)
exports.refreshToken = asyncHandler(async (req, res, next) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!refreshToken) {
    return next(new AppError('No refresh token provided', 401));
  }

  const decoded = verifyRefreshToken(refreshToken);
  const user = await User.findById(decoded.id).select('+refreshTokens');

  if (!user || !user.isActive) {
    return next(new AppError('User not found or inactive', 401));
  }

  const accessToken = generateAccessToken(user._id, user.role);

  res.status(200).json({
    success: true,
    accessToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

// @desc    Forgot password
// @route   POST /api/v1/auth/forgot-password
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    // Security: don't reveal if email exists
    return res.status(200).json({ success: true, message: 'If that email is registered, you will receive a reset code.' });
  }

  const otp = generateOTP();
  user.otpHash = hashOTP(otp);
  user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  user.otpAttempts = 0;
  await user.save({ validateBeforeSave: false });

  // TODO: Send email with OTP
  console.log(`Password reset OTP for ${email}: ${otp}`);

  res.status(200).json({ success: true, message: 'Password reset code sent to your email' });
});

// @desc    Reset password with OTP
// @route   POST /api/v1/auth/reset-password
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { email, otp, newPassword } = req.body;

  const user = await User.findOne({ email }).select('+otpHash +otpExpiry +otpAttempts');
  if (!user) return next(new AppError('User not found', 404));

  if (!user.otpHash || user.otpExpiry < new Date()) {
    return next(new AppError('OTP expired or invalid', 400));
  }

  if (hashOTP(otp) !== user.otpHash) {
    user.otpAttempts += 1;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('Invalid OTP', 400));
  }

  user.password = newPassword;
  user.otpHash = undefined;
  user.otpExpiry = undefined;
  user.otpAttempts = 0;
  await user.save();

  userSessionCache.delete(user._id.toString());

  sendTokenResponse(user, 200, res, 'Password reset successful');
});

// @desc    Change password (authenticated)
// @route   PUT /api/v1/auth/change-password
// @access  Private
exports.changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  const isMatch = await user.comparePassword(currentPassword);

  if (!isMatch) return next(new AppError('Current password is incorrect', 401));

  user.password = newPassword;
  await user.save();

  // Invalidate all sessions
  userSessionCache.delete(user._id.toString());
  await User.findByIdAndUpdate(user._id, { $set: { refreshTokens: [] } });

  sendTokenResponse(user, 200, res, 'Password changed successfully');
});

// @desc    Get current user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate('boats', 'name type dimensions.lengthFt status primaryPhoto');

  res.status(200).json({ success: true, data: user });
});
