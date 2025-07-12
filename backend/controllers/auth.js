// @ts-nocheck
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../middleware/async.js';
import User from '../models/User.js';
import LoginLog from '../models/LoginLog.js';

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
export const register = asyncHandler(async (req, res, next) => {
  const { username, email, name, phone, password, role } = req.body;

  // Create user
  const user = await User.create({
    username,
    email,
    name,
    phone,
    password,
    role: role || 'clerk'
  });

  sendTokenResponse(user, 200, res);
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
export const login = asyncHandler(async (req, res, next) => {
  const { username, password } = req.body;
  
  // Validate email & password
  if (!username || !password) {
    return next(new ErrorResponse('Please provide username and password', 400));
  }

  // Check for user
  const user = await User.findOne({ username }).select('+password');

  if (!user) {
    // Log failed login attempt
    await LoginLog.create({
      userId: null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'failed',
      failureReason: 'User not found'
    });
    
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if account is locked
  if (user.isLocked) {
    // Log locked account attempt
    await LoginLog.create({
      userId: user._id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'locked',
      failureReason: 'Account locked'
    });
    
    return next(new ErrorResponse('Your account has been locked due to too many failed login attempts. Please contact an administrator.', 423));
  }

  // Check if account is active
  if (!user.isActive) {
    // Log inactive account attempt
    await LoginLog.create({
      userId: user._id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'failed',
      failureReason: 'Account inactive'
    });
    
    return next(new ErrorResponse('Your account is inactive. Please contact an administrator.', 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    // Increment failed login attempts
    user.failedLoginAttempts += 1;
    
    // Lock account if max attempts reached (default: 3)
    if (user.failedLoginAttempts >= 3) {
      user.isLocked = true;
    }
    
    await user.save();
    
    // Log failed login attempt
    await LoginLog.create({
      userId: user._id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'failed',
      failureReason: 'Invalid password'
    });
    
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Generate session token
  const sessionToken = 'sess_' + Date.now().toString();
  
  // Reset failed login attempts on successful login
  user.failedLoginAttempts = 0;
  user.isOnline = true;
  user.lastLogin = Date.now();
  user.sessionToken = sessionToken;
  await user.save();
  
  // Log successful login
  const loginLog = await LoginLog.create({
    userId: user._id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    status: 'success',
    sessionId: sessionToken
  });

  sendTokenResponse(user, 200, res);
});

// @desc    Log user out / clear cookie
// @route   GET /api/v1/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res, next) => {
  // Update user status
  req.user.isOnline = false;
  req.user.lastLogout = Date.now();
  req.user.sessionToken = undefined;
  await req.user.save();
  
  // Log logout
  await LoginLog.create({
    userId: req.user._id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    status: 'logout',
    loginTime: req.user.lastLogin
  });

  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user details
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
export const updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
export const updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }

  user.password = req.body.newPassword;
  user.requirePasswordChange = false;
  user.passwordLastChanged = Date.now();
  await user.save();

  sendTokenResponse(user, 200, res);
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user:user
    });
};