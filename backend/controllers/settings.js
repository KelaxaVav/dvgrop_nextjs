import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../middleware/async.js';
import Setting from '../models/Setting.js';
import LeaveDay from '../models/LeaveDay.js';
import { isWeekend, parseISO } from 'date-fns';

// @desc    Get all settings
// @route   GET /api/v1/settings
// @access  Private/Admin
export const getSettings = asyncHandler(async (req, res, next) => {
  const settings = await Setting.find();

  // Convert to key-value object
  const settingsObject = settings.reduce((obj, setting) => {
    obj[setting.key] = setting.value;
    return obj;
  }, {});

  res.status(200).json({
    success: true,
    data: settingsObject
  });
});

// @desc    Get settings by group
// @route   GET /api/v1/settings/:group
// @access  Private/Admin
export const getSettingsByGroup = asyncHandler(async (req, res, next) => {
  const settings = await Setting.find({ group: req.params.group });

  // Convert to key-value object
  const settingsObject = settings.reduce((obj, setting) => {
    obj[setting.key] = setting.value;
    return obj;
  }, {});

  res.status(200).json({
    success: true,
    data: settingsObject
  });
});

// @desc    Update settings
// @route   PUT /api/v1/settings/:group
// @access  Private/Admin
export const updateSettings = asyncHandler(async (req, res, next) => {
  const { group } = req.params;
  const settings = req.body;

  if (!settings || Object.keys(settings).length === 0) {
    return next(new ErrorResponse('No settings provided', 400));
  }

  // Update each setting
  const updatedSettings = [];
  for (const [key, value] of Object.entries(settings)) {
    // Find existing setting or create new one
    let setting = await Setting.findOne({ key });
    
    if (setting) {
      setting.value = value;
      setting.group = group;
      setting.updatedBy = req.user.id;
      setting.updatedAt = Date.now();
      await setting.save();
    } else {
      setting = await Setting.create({
        key,
        value,
        group,
        updatedBy: req.user.id
      });
    }
    
    updatedSettings.push(setting);
  }

  res.status(200).json({
    success: true,
    data: updatedSettings
  });
});

// @desc    Get leave days
// @route   GET /api/v1/settings/leave-days
// @access  Private
export const getLeaveDays = asyncHandler(async (req, res, next) => {
  const leaveDays = await LeaveDay.find().sort('date');

  res.status(200).json({
    success: true,
    count: leaveDays.length,
    data: leaveDays
  });
});

// @desc    Add leave day
// @route   POST /api/v1/settings/leave-days
// @access  Private/Admin
export const addLeaveDay = asyncHandler(async (req, res, next) => {
  const { date, reason } = req.body;

  if (!date || !reason) {
    return next(new ErrorResponse('Please provide date and reason', 400));
  }

  // Check if date already exists
  const existingLeaveDay = await LeaveDay.findOne({ date: new Date(date) });
  
  if (existingLeaveDay) {
    return next(new ErrorResponse('This date is already marked as a leave day', 400));
  }

  const leaveDay = await LeaveDay.create({
    date,
    reason,
    createdBy: req.user.id
  });

  res.status(201).json({
    success: true,
    data: leaveDay
  });
});

// @desc    Delete leave day
// @route   DELETE /api/v1/settings/leave-days/:id
// @access  Private/Admin
export const deleteLeaveDay = asyncHandler(async (req, res, next) => {
  const leaveDay = await LeaveDay.findById(req.params.id);

  if (!leaveDay) {
    return next(new ErrorResponse(`Leave day not found with id of ${req.params.id}`, 404));
  }

  await leaveDay.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Calculate collection days
// @route   POST /api/v1/settings/collection-days/calculate
// @access  Private
export const calculateCollectionDays = asyncHandler(async (req, res, next) => {
  const { startDate, endDate, excludeSaturdays } = req.body;

  if (!startDate || !endDate) {
    return next(new ErrorResponse('Please provide start and end dates', 400));
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Ensure end date is not before start date
  if (end < start) {
    return next(new ErrorResponse('End date cannot be before start date', 400));
  }
  
  // Calculate total days (inclusive of start and end dates)
  const totalDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  let sundaysCount = 0;
  let saturdaysCount = 0;
  let leaveDaysCount = 0;
  const leaveDatesInRange = [];
  
  // Get all leave days
  const allLeaveDays = await LeaveDay.find();
  
  // Loop through each day in the range
  const currentDate = new Date(start);
  while (currentDate <= end) {
    // Check if it's a Sunday
    if (currentDate.getDay() === 0) {
      sundaysCount++;
    } 
    // Check if it's a Saturday and we're excluding Saturdays
    else if (excludeSaturdays && currentDate.getDay() === 6) {
      saturdaysCount++;
    } 
    // Check if it's a leave day
    else {
      const isLeaveDay = allLeaveDays.some(leave => {
        const leaveDate = new Date(leave.date);
        return leaveDate.toDateString() === currentDate.toDateString();
      });
      
      if (isLeaveDay) {
        leaveDaysCount++;
        const leaveDay = allLeaveDays.find(leave => {
          const leaveDate = new Date(leave.date);
          return leaveDate.toDateString() === currentDate.toDateString();
        });
        
        if (leaveDay) {
          leaveDatesInRange.push(leaveDay);
        }
      }
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Calculate collection days
  const collectionDays = totalDays - sundaysCount - (excludeSaturdays ? saturdaysCount : 0) - leaveDaysCount;

  res.status(200).json({
    success: true,
    data: {
      totalDays,
      sundaysCount,
      saturdaysCount,
      leaveDaysCount,
      collectionDays,
      leaveDatesInRange
    }
  });
});