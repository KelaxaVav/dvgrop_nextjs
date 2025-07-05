import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../middleware/async.js';
import User from '../models/User.js';
import LoginLog from '../models/LoginLog.js';

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private/Admin
export const getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Private/Admin
export const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Create user
// @route   POST /api/v1/users
// @access  Private/Admin
export const createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  res.status(201).json({
    success: true,
    data: user
  });
});

// @desc    Update user
// @route   PUT /api/v1/users/:id
// @access  Private/Admin
export const updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  // Delete user's login logs
  await LoginLog.deleteMany({ userId: user._id });
  
  // Delete the user
  await user.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get user login history
// @route   GET /api/v1/users/:id/login-history
// @access  Private/Admin
export const getUserLoginHistory = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  const loginLogs = await LoginLog.find({ userId: user._id }).sort('-loginTime');

  res.status(200).json({
    success: true,
    count: loginLogs.length,
    data: loginLogs
  });
});

// @desc    Unlock user account
// @route   PUT /api/v1/users/:id/unlock
// @access  Private/Admin
export const unlockUserAccount = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  user.isLocked = false;
  user.failedLoginAttempts = 0;
  user.updatedAt = Date.now();
  await user.save();

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Force logout user
// @route   PUT /api/v1/users/:id/force-logout
// @access  Private/Admin
export const forceLogoutUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  user.isOnline = false;
  user.lastLogout = Date.now();
  user.sessionToken = undefined;
  user.updatedAt = Date.now();
  await user.save();
  
  // Log forced logout
  await LoginLog.create({
    userId: user._id,
    ipAddress: req.ip,
    userAgent: 'System',
    status: 'logout',
    loginTime: user.lastLogin,
    logoutTime: Date.now()
  });

  res.status(200).json({
    success: true,
    data: user
  });
});