import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../middleware/async.js';
import Repayment from '../models/Repayment.js';
import Loan from '../models/Loan.js';
import Customer from '../models/Customer.js';
import Setting from '../models/Setting.js';
import { sendSMS } from '../utils/sms.js';
import { isAfter, differenceInDays } from 'date-fns';

// @desc    Get all repayments
// @route   GET /api/v1/payments
// @route   GET /api/v1/loans/:loanId/payments
// @access  Private
export const getRepayments = asyncHandler(async (req, res, next) => {
  if (req.params.loanId) {
    const repayments = await Repayment.find({ loanId: req.params.loanId })
      .sort('emiNo');

    return res.status(200).json({
      success: true,
      count: repayments.length,
      data: repayments
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc    Get single repayment
// @route   GET /api/v1/payments/:id
// @access  Private
export const getRepayment = asyncHandler(async (req, res, next) => {
  const repayment = await Repayment.findById(req.params.id)
    .populate({
      path: 'loanId',
      select: 'customerId type period emi interestRate',
      populate: {
        path: 'customerId',
        select: 'name nic phone email'
      }
    })
    .populate('processedBy', 'name');

  if (!repayment) {
    return next(new ErrorResponse(`Repayment not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: repayment
  });
});

// @desc    Create repayment
// @route   POST /api/v1/loans/:loanId/payments
// @access  Private
export const createRepayment = asyncHandler(async (req, res, next) => {
  req.body.loanId = req.params.loanId;
  req.body.processedBy = req.user.id;
  console.log("request body",req.body)

  const loan = await Loan.findById(req.params.loanId);

  if (!loan) {
    return next(new ErrorResponse(`Loan not found with id of ${req.params.loanId}`, 404));
  }

  const repayment = await Repayment.create(req.body);

  // Check if payment notification should be sent
  const notificationSettings = await Setting.findOne({ key: 'notificationSettings' });
  
  if (notificationSettings && notificationSettings.value.notifyOnPaymentReceived && notificationSettings.value.smsEnabled) {
    // Get customer
    const customer = await Customer.findById(loan.customerId);
    
    if (customer) {
      // Get SMS template
      const smsTemplates = notificationSettings.value.smsTemplates;
      
      if (smsTemplates && smsTemplates.paymentReceipt) {
        // Calculate remaining balance
        const remainingRepayments = await Repayment.find({ 
          loanId: loan._id, 
          status: { $in: ['pending', 'partial'] } 
        });
        
        const totalBalance = remainingRepayments.reduce((sum, r) => sum + r.balance, 0);
        
        // Replace placeholders in template
        let message = smsTemplates.paymentReceipt
          .replace('[Name]', customer.name)
          .replace('[Amount]', repayment.paidAmount.toString())
          .replace('[Date]', new Date(repayment.paymentDate).toLocaleDateString())
          .replace('[Balance]', totalBalance.toString());
        
        // Send SMS
        await sendSMS(customer.phone, message, 'paymentReceipt', customer._id, customer.name);
      }
    }
  }

  res.status(201).json({
    success: true,
    data: repayment
  });
});

// @desc    Update repayment
// @route   PUT /api/v1/payments/:id
// @access  Private
export const updateRepayment = asyncHandler(async (req, res, next) => {
  let repayment = await Repayment.findById(req.params.id);

  if (!repayment) {
    return next(new ErrorResponse(`Repayment not found with id of ${req.params.id}`, 404));
  }

  // Add processor info if not already set
  if (!repayment.processedBy && req.body.status === 'paid') {
    req.body.processedBy = req.user.id;
  }
  
  // Generate receipt number if not provided
  if (req.body.status === 'paid' && !req.body.receiptNumber && !repayment.receiptNumber) {
    req.body.receiptNumber = `RCP-${Date.now()}`;
  }

  repayment = await Repayment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  // Check if payment notification should be sent
  if ((req.body.status === 'paid' || req.body.status === 'partial') && req.body.sendSMS) {
    const notificationSettings = await Setting.findOne({ key: 'notificationSettings' });
    
    if (notificationSettings && notificationSettings.value.notifyOnPaymentReceived && notificationSettings.value.smsEnabled) {
      // Get loan and customer
      const loan = await Loan.findById(repayment.loanId);
      const customer = await Customer.findById(loan.customerId);
      
      if (customer) {
        // Get SMS template
        const smsTemplates = notificationSettings.value.smsTemplates;
        
        if (smsTemplates && smsTemplates.paymentReceipt) {
          // Calculate remaining balance
          const remainingRepayments = await Repayment.find({ 
            loanId: loan._id, 
            status: { $in: ['pending', 'partial'] } 
          });
          
          const totalBalance = remainingRepayments.reduce((sum, r) => sum + r.balance, 0);
          
          // Replace placeholders in template
          let message = smsTemplates.paymentReceipt
            .replace('[Name]', customer.name)
            .replace('[Amount]', repayment.paidAmount.toString())
            .replace('[Date]', new Date(repayment.paymentDate).toLocaleDateString())
            .replace('[Balance]', totalBalance.toString());
          
          // Send SMS
          await sendSMS(customer.phone, message, 'paymentReceipt', customer._id, customer.name);
        }
      }
    }
  }

  // Check if all repayments are paid and update loan status if needed
  if (req.body.status === 'paid') {
    const loan = await Loan.findById(repayment.loanId);
    
    if (loan) {
      const pendingRepayments = await Repayment.countDocuments({ 
        loanId: loan._id, 
        status: { $in: ['pending', 'partial'] } 
      });
      
      if (pendingRepayments === 0) {
        // All repayments are paid, mark loan as completed
        loan.status = 'completed';
        await loan.save();
      }
    }
  }

  res.status(200).json({
    success: true,
    data: repayment
  });
});

// @desc    Process bulk payments
// @route   POST /api/v1/payments/bulk
// @access  Private
export const processBulkPayments = asyncHandler(async (req, res, next) => {
  const { payments } = req.body;
  
  if (!payments || !Array.isArray(payments)) {
    return next(new ErrorResponse('Please provide an array of payments', 400));
  }
  
  const results = {
    success: [],
    failed: []
  };
  
  // Process each payment
  for (const payment of payments) {
    try {
      // Validate payment data
      if (!payment.loanId || !payment.emiNo || !payment.amount || !payment.paymentDate || !payment.paymentMode) {
        results.failed.push({
          ...payment,
          error: 'Missing required fields'
        });
        continue;
      }
      
      // Find repayment
      const repayment = await Repayment.findOne({ 
        loanId: payment.loanId, 
        emiNo: payment.emiNo 
      });
      
      if (!repayment) {
        results.failed.push({
          ...payment,
          error: 'Repayment not found'
        });
        continue;
      }
      
      if (repayment.status === 'paid') {
        results.failed.push({
          ...payment,
          error: 'EMI already paid'
        });
        continue;
      }
      
      // Update repayment
      const updatedRepayment = await Repayment.findByIdAndUpdate(
        repayment._id,
        {
          paidAmount: payment.amount,
          paymentDate: payment.paymentDate,
          paymentMode: payment.paymentMode,
          status: payment.amount >= repayment.amount ? 'paid' : 'partial',
          balance: Math.max(0, repayment.amount - payment.amount),
          remarks: payment.remarks,
          processedBy: req.user.id,
          receiptNumber: payment.receiptNumber || `RCP-${Date.now()}-${repayment.emiNo}`
        },
        { new: true }
      );
      
      results.success.push(updatedRepayment);
      
    } catch (error) {
      results.failed.push({
        ...payment,
        error: error.message
      });
    }
  }
  
  res.status(200).json({
    success: true,
    data: {
      processed: results.success.length,
      failed: results.failed.length,
      results
    }
  });
});

// @desc    Get daily payments
// @route   GET /api/v1/payments/daily/:date
// @access  Private
export const getDailyPayments = asyncHandler(async (req, res, next) => {
  const date = req.params.date ? new Date(req.params.date) : new Date();
  
  // Set time to beginning of day
  date.setHours(0, 0, 0, 0);
  
  // Find all repayments due on this date
  const repayments = await Repayment.find({
    dueDate: {
      $gte: date,
      $lt: new Date(date.getTime() + 24 * 60 * 60 * 1000)
    }
  }).populate({
    path: 'loanId',
    select: 'customerId type period emi',
    populate: {
      path: 'customerId',
      select: 'name phone'
    }
  });
  
  // Enhance repayments with additional info
  const enhancedRepayments = await Promise.all(repayments.map(async (repayment) => {
    // Check if overdue
    const isOverdue = isAfter(new Date(), new Date(repayment.dueDate)) && repayment.status !== 'paid';
    
    // Get next payment date
    const nextRepayment = await Repayment.findOne({ 
      loanId: repayment.loanId._id, 
      emiNo: repayment.emiNo + 1 
    });
    
    return {
      ...repayment._doc,
      isOverdue,
      daysOverdue: isOverdue ? differenceInDays(new Date(), new Date(repayment.dueDate)) : 0,
      nextPaymentDate: nextRepayment ? nextRepayment.dueDate : null
    };
  }));

  res.status(200).json({
    success: true,
    count: enhancedRepayments.length,
    data: enhancedRepayments
  });
});

// @desc    Get overdue payments
// @route   GET /api/v1/payments/overdue
// @access  Private
export const getOverduePayments = asyncHandler(async (req, res, next) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Find all overdue repayments
  const overdueRepayments = await Repayment.find({
    dueDate: { $lt: today },
    status: { $in: ['pending', 'partial'] }
  }).populate({
    path: 'loanId',
    select: 'customerId type period emi',
    populate: {
      path: 'customerId',
      select: 'name phone'
    }
  });
  
  // Get penalty settings
  const advancedSettings = await Setting.findOne({ key: 'advancedSettings' });
  const penaltySettings = advancedSettings?.value?.penaltySettings || {
    penaltyRate: 2.0,
    penaltyType: 'per_day'
  };
  
  // Calculate penalty for each repayment
  const repaymentsWithPenalty = overdueRepayments.map(repayment => {
    const daysOverdue = differenceInDays(new Date(), new Date(repayment.dueDate));
    let penalty = 0;
    
    switch (penaltySettings.penaltyType) {
      case 'per_day':
        penalty = Math.round(repayment.amount * (penaltySettings.penaltyRate / 100) * daysOverdue);
        break;
      case 'per_week':
        const weeksOverdue = Math.ceil(daysOverdue / 7);
        penalty = Math.round(repayment.amount * (penaltySettings.penaltyRate / 100) * weeksOverdue);
        break;
      case 'fixed_total':
        penalty = Math.round(repayment.amount * (penaltySettings.penaltyRate / 100));
        break;
      default:
        penalty = Math.round(repayment.amount * (penaltySettings.penaltyRate / 100) * daysOverdue);
    }
    
    return {
      ...repayment._doc,
      daysOverdue,
      penalty
    };
  });

  res.status(200).json({
    success: true,
    count: repaymentsWithPenalty.length,
    data: repaymentsWithPenalty
  });
});