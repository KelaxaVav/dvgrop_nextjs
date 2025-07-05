import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../middleware/async.js';
import LeaveDay from '../models/LeaveDay.js';
import { isWeekend, parseISO, differenceInDays, eachDayOfInterval } from 'date-fns';

// @desc    Calculate collection days
// @route   POST /api/v1/collection-days/calculate
// @access  Private
export const calculateCollectionDays = asyncHandler(async (req, res, next) => {
  const { startDate, endDate, excludeSaturdays } = req.body;

  if (!startDate || !endDate) {
    return next(new ErrorResponse('Please provide start and end dates', 400));
  }

  const start = parseISO(startDate);
  const end = parseISO(endDate);
  
  // Ensure end date is not before start date
  if (end < start) {
    return next(new ErrorResponse('End date cannot be before start date', 400));
  }
  
  // Calculate total days (inclusive of start and end dates)
  const totalDays = differenceInDays(end, start) + 1;
  
  // Get all days in the range
  const daysInRange = eachDayOfInterval({ start, end });
  
  // Count Sundays and Saturdays
  let sundaysCount = 0;
  let saturdaysCount = 0;
  
  daysInRange.forEach(date => {
    const day = date.getDay();
    if (day === 0) sundaysCount++;
    else if (day === 6) saturdaysCount++;
  });
  
  // Get leave days in range
  const leaveDaysInRange = await LeaveDay.find({
    date: { $gte: start, $lte: end }
  });
  
  // Filter out leave days that fall on Sundays or Saturdays (if excluded)
  const validLeaveDays = leaveDaysInRange.filter(leaveDay => {
    const leaveDate = new Date(leaveDay.date);
    const day = leaveDate.getDay();
    
    return !(day === 0 || (excludeSaturdays && day === 6));
  });
  
  // Calculate collection days
  const collectionDays = totalDays - sundaysCount - (excludeSaturdays ? saturdaysCount : 0) - validLeaveDays.length;
  
  res.status(200).json({
    success: true,
    data: {
      totalDays,
      sundaysCount,
      saturdaysCount,
      leaveDaysCount: validLeaveDays.length,
      collectionDays,
      leaveDatesInRange: validLeaveDays
    }
  });
});

// @desc    Get all leave days
// @route   GET /api/v1/collection-days/leave-days
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
// @route   POST /api/v1/collection-days/leave-days
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
// @route   DELETE /api/v1/collection-days/leave-days/:id
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