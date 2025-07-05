import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../middleware/async.js';
import SmsLog from '../models/SmsLog.js';
import Customer from '../models/Customer.js';
import Setting from '../models/Setting.js';
import { sendSMS } from '../utils/sms.js';

// @desc    Get all SMS logs
// @route   GET /api/v1/sms/logs
// @access  Private
export const getSmsLogs = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get SMS logs by customer
// @route   GET /api/v1/sms/logs/customer/:customerId
// @access  Private
export const getCustomerSmsLogs = asyncHandler(async (req, res, next) => {
  const customer = await Customer.findById(req.params.customerId);

  if (!customer) {
    return next(new ErrorResponse(`Customer not found with id of ${req.params.customerId}`, 404));
  }

  const smsLogs = await SmsLog.find({ customerId: req.params.customerId })
    .sort('-sentAt');

  res.status(200).json({
    success: true,
    count: smsLogs.length,
    data: smsLogs
  });
});

// @desc    Send SMS
// @route   POST /api/v1/sms/send
// @access  Private
export const sendSmsMessage = asyncHandler(async (req, res, next) => {
  const { to, message, type, customerId, customerName } = req.body;

  if (!to || !message || !type || !customerId || !customerName) {
    return next(new ErrorResponse('Please provide all required fields', 400));
  }

  // Check if SMS is enabled in settings
  const notificationSettings = await Setting.findOne({ key: 'notificationSettings' });
  
  if (!notificationSettings || !notificationSettings.value.smsEnabled) {
    return next(new ErrorResponse('SMS notifications are disabled in system settings', 400));
  }

  // Send SMS
  const result = await sendSMS(to, message, type, customerId, customerName);

  res.status(200).json({
    success: true,
    data: result
  });
});

// @desc    Send bulk SMS
// @route   POST /api/v1/sms/send-bulk
// @access  Private
export const sendBulkSms = asyncHandler(async (req, res, next) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return next(new ErrorResponse('Please provide an array of messages', 400));
  }

  // Check if SMS is enabled in settings
  const notificationSettings = await Setting.findOne({ key: 'notificationSettings' });
  
  if (!notificationSettings || !notificationSettings.value.smsEnabled) {
    return next(new ErrorResponse('SMS notifications are disabled in system settings', 400));
  }

  const results = {
    success: [],
    failed: []
  };

  // Send each message
  for (const msg of messages) {
    try {
      if (!msg.to || !msg.message || !msg.type || !msg.customerId || !msg.customerName) {
        results.failed.push({
          ...msg,
          error: 'Missing required fields'
        });
        continue;
      }

      const result = await sendSMS(
        msg.to,
        msg.message,
        msg.type,
        msg.customerId,
        msg.customerName
      );

      if (result.status === 'delivered') {
        results.success.push(result);
      } else {
        results.failed.push(result);
      }
    } catch (error) {
      results.failed.push({
        ...msg,
        error: error.message
      });
    }
  }

  res.status(200).json({
    success: true,
    data: {
      total: messages.length,
      successful: results.success.length,
      failed: results.failed.length,
      results
    }
  });
});

// @desc    Get SMS templates
// @route   GET /api/v1/sms/templates
// @access  Private
export const getSmsTemplates = asyncHandler(async (req, res, next) => {
  const notificationSettings = await Setting.findOne({ key: 'notificationSettings' });
  
  if (!notificationSettings) {
    return next(new ErrorResponse('Notification settings not found', 404));
  }

  res.status(200).json({
    success: true,
    data: notificationSettings.value.smsTemplates || {}
  });
});

// @desc    Update SMS templates
// @route   PUT /api/v1/sms/templates
// @access  Private/Admin
export const updateSmsTemplates = asyncHandler(async (req, res, next) => {
  const templates = req.body;

  if (!templates || Object.keys(templates).length === 0) {
    return next(new ErrorResponse('No templates provided', 400));
  }

  let notificationSettings = await Setting.findOne({ key: 'notificationSettings' });
  
  if (!notificationSettings) {
    // Create default notification settings if not found
    notificationSettings = await Setting.create({
      key: 'notificationSettings',
      value: {
        smsEnabled: true,
        emailEnabled: false,
        reminderTime: 1,
        smsTemplates: templates,
        emailTemplates: {},
        notifyOnLoanApplication: true,
        notifyOnLoanApproval: true,
        notifyOnPaymentDue: true,
        notifyOnPaymentReceived: true,
        notifyOnLatePayment: true
      },
      group: 'notification',
      updatedBy: req.user.id
    });
  } else {
    // Update existing templates
    notificationSettings.value.smsTemplates = templates;
    notificationSettings.updatedBy = req.user.id;
    notificationSettings.updatedAt = Date.now();
    await notificationSettings.save();
  }

  res.status(200).json({
    success: true,
    data: notificationSettings.value.smsTemplates
  });
});

// @desc    Get pending notifications
// @route   GET /api/v1/sms/pending-notifications
// @access  Private
export const getPendingNotifications = asyncHandler(async (req, res, next) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Get notification settings
  const notificationSettings = await Setting.findOne({ key: 'notificationSettings' });
  
  if (!notificationSettings || !notificationSettings.value.smsEnabled) {
    return res.status(200).json({
      success: true,
      count: 0,
      data: []
    });
  }
  
  // Find overdue payments
  const overduePayments = await Repayment.find({
    dueDate: { $lt: today },
    status: { $in: ['pending', 'partial'] }
  }).populate({
    path: 'loanId',
    select: 'customerId',
    populate: {
      path: 'customerId',
      select: 'name phone'
    }
  });
  
  // Find payments due tomorrow
  const dueTomorrowPayments = await Repayment.find({
    dueDate: {
      $gte: tomorrow,
      $lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)
    },
    status: { $in: ['pending', 'partial'] }
  }).populate({
    path: 'loanId',
    select: 'customerId',
    populate: {
      path: 'customerId',
      select: 'name phone'
    }
  });
  
  // Check which notifications have already been sent
  const recentOverdueNotifications = await SmsLog.find({
    type: 'latePayment',
    sentAt: { $gte: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000) }
  });
  
  const recentReminderNotifications = await SmsLog.find({
    type: 'preDueReminder',
    sentAt: { $gte: new Date(today.getTime() - 24 * 60 * 60 * 1000) }
  });
  
  // Filter out payments that already have notifications
  const pendingOverdueNotifications = overduePayments.filter(payment => {
    return !recentOverdueNotifications.some(notification => 
      notification.message.includes(payment._id.toString())
    );
  });
  
  const pendingReminderNotifications = dueTomorrowPayments.filter(payment => {
    return !recentReminderNotifications.some(notification => 
      notification.message.includes(payment._id.toString())
    );
  });
  
  // Prepare notification data
  const notifications = [
    ...pendingOverdueNotifications.map(payment => ({
      type: 'latePayment',
      customer: payment.loanId.customerId,
      payment,
      loan: payment.loanId,
      daysOverdue: Math.floor((today.getTime() - new Date(payment.dueDate).getTime()) / (1000 * 60 * 60 * 24))
    })),
    ...pendingReminderNotifications.map(payment => ({
      type: 'preDueReminder',
      customer: payment.loanId.customerId,
      payment,
      loan: payment.loanId
    }))
  ];

  res.status(200).json({
    success: true,
    count: notifications.length,
    data: notifications
  });
});