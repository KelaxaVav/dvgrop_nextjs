import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../middleware/async.js';
import Loan from '../models/Loan.js';
import Customer from '../models/Customer.js';
import Repayment from '../models/Repayment.js';
import EmailContact from '../models/EmailContact.js';
import Setting from '../models/Setting.js';
import { sendSMS } from '../utils/sms.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Get all loans
// @route   GET /api/v1/loans
// @route   GET /api/v1/customers/:customerId/loans
// @access  Private
export const getLoans = asyncHandler(async (req, res, next) => {
  if (req.params.customerId) {
    const loans = await Loan.find({ customerId: req.params.customerId });

    return res.status(200).json({
      success: true,
      count: loans.length,
      data: loans
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc    Get single loan
// @route   GET /api/v1/loans/:id
// @access  Private
export const getLoan = asyncHandler(async (req, res, next) => {
  const loan = await Loan.findById(req.params.id)
    .populate('customerId', 'name nic phone email')
    .populate('approvedBy', 'name')
    .populate('disbursedBy', 'name')
    .populate('createdBy', 'name');

  if (!loan) {
    return next(new ErrorResponse(`Loan not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: loan
  });
});

// @desc    Create new loan
// @route   POST /api/v1/customers/:customerId/loans
// @access  Private
export const createLoan = asyncHandler(async (req, res, next) => {
  req.body.customerId = req.params.customerId;
  req.body.createdBy = req.user.id;

  const customer = await Customer.findById(req.params.customerId);

  if (!customer) {
    return next(new ErrorResponse(`Customer not found with id of ${req.params.customerId}`, 404));
  }

  // Get loan ID prefix from settings
  const loanIdSetting = await Setting.findOne({ key: 'loanIdPrefix' });
  const prefix = loanIdSetting ? loanIdSetting.value : 'L';
  
  // Generate loan ID
  const count = await Loan.countDocuments();
  const loanId = `${prefix}${(count + 1).toString().padStart(3, '0')}`;
  
  // Create loan with custom ID
  const loan = await Loan.create({
    ...req.body,
    _id: loanId
  });

  // Check notification settings
  const notificationSettings = await Setting.findOne({ key: 'notificationSettings' });
  
  if (notificationSettings && notificationSettings.value.notifyOnLoanApplication && notificationSettings.value.smsEnabled) {
    // Get SMS template
    const smsTemplates = notificationSettings.value.smsTemplates;
    
    if (smsTemplates && smsTemplates.loanApplication) {
      // Replace placeholders in template
      let message = smsTemplates.loanApplication
        .replace('[Name]', customer.name)
        .replace('[Amount]', loan.requestedAmount.toString())
        .replace('[LoanID]', loan._id);
      
      // Send SMS
      await sendSMS(customer.phone, message, 'loanApplication', customer._id, customer.name);
    }
  }

  res.status(201).json({
    success: true,
    data: loan
  });
});

// @desc    Update loan
// @route   PUT /api/v1/loans/:id
// @access  Private
export const updateLoan = asyncHandler(async (req, res, next) => {
  let loan = await Loan.findById(req.params.id);

  if (!loan) {
    return next(new ErrorResponse(`Loan not found with id of ${req.params.id}`, 404));
  }

  // Check if loan status is being updated to approved
  const isApproved = req.body.status === 'approved' && loan.status !== 'approved';
  
  // Check if loan status is being updated to rejected
  const isRejected = req.body.status === 'rejected' && loan.status !== 'rejected';
  
  // Update loan
  loan = await Loan.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  // If loan is approved, check if customer should be added to email contacts
  if (isApproved) {
    const customer = await Customer.findById(loan.customerId);
    
    if (customer && customer.email) {
      // Check email sync settings
      const emailSyncConfig = await Setting.findOne({ key: 'emailSyncConfig' });
      
      if (emailSyncConfig && emailSyncConfig.value.syncOnLoanApproval) {
        // Check if contact already exists
        const existingContact = await EmailContact.findOne({ customerId: customer._id });
        
        if (existingContact) {
          // Update existing contact with loan info
          existingContact.loanId = loan._id;
          existingContact.tags = [...new Set([...existingContact.tags || [], 'approved-loan'])];
          existingContact.syncStatus = 'pending';
          existingContact.updatedAt = Date.now();
          await existingContact.save();
        } else {
          // Add new contact
          await EmailContact.create({
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            source: 'loan_approval',
            customerId: customer._id,
            loanId: loan._id,
            syncStatus: 'pending',
            isSubscribed: true,
            tags: ['customer', 'approved-loan'],
            createdBy: req.user.id
          });
        }
      }
    }
    
    // Check notification settings for loan approval
    const notificationSettings = await Setting.findOne({ key: 'notificationSettings' });
    
    if (notificationSettings && notificationSettings.value.notifyOnLoanApproval && notificationSettings.value.smsEnabled) {
      // Get customer
      const customer = await Customer.findById(loan.customerId);
      
      if (customer) {
        // Get SMS template
        const smsTemplates = notificationSettings.value.smsTemplates;
        
        if (smsTemplates && smsTemplates.loanApproval) {
          // Replace placeholders in template
          let message = smsTemplates.loanApproval
            .replace('[Name]', customer.name)
            .replace('[Amount]', (loan.approvedAmount || loan.requestedAmount).toString())
            .replace('[Date]', new Date(loan.startDate).toLocaleDateString());
          
          // Send SMS
          await sendSMS(customer.phone, message, 'loanApproval', customer._id, customer.name);
        }
      }
    }
  }
  
  // If loan is rejected, send notification
  if (isRejected) {
    // Check notification settings for loan rejection
    const notificationSettings = await Setting.findOne({ key: 'notificationSettings' });
    
    if (notificationSettings && notificationSettings.value.smsEnabled) {
      // Get customer
      const customer = await Customer.findById(loan.customerId);
      
      if (customer) {
        // Get SMS template
        const smsTemplates = notificationSettings.value.smsTemplates;
        
        if (smsTemplates && smsTemplates.loanRejection) {
          // Replace placeholders in template
          let message = smsTemplates.loanRejection
            .replace('[Name]', customer.name)
            .replace('[LoanID]', loan._id);
          
          // Send SMS
          await sendSMS(customer.phone, message, 'loanRejection', customer._id, customer.name);
        }
      }
    }
  }

  res.status(200).json({
    success: true,
    data: loan
  });
});

// @desc    Delete loan
// @route   DELETE /api/v1/loans/:id
// @access  Private/Admin
export const deleteLoan = asyncHandler(async (req, res, next) => {
  const loan = await Loan.findById(req.params.id);

  if (!loan) {
    return next(new ErrorResponse(`Loan not found with id of ${req.params.id}`, 404));
  }

  // Check if loan has repayments
  const repayments = await Repayment.find({ loanId: loan._id });
  
  if (repayments.length > 0) {
    return next(new ErrorResponse(`Cannot delete loan with existing repayments`, 400));
  }
  
  // Delete loan
  await loan.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Upload loan document
// @route   PUT /api/v1/loans/:id/documents
// @access  Private
export const uploadLoanDocument = asyncHandler(async (req, res, next) => {
  const loan = await Loan.findById(req.params.id);

  if (!loan) {
    return next(new ErrorResponse(`Loan not found with id of ${req.params.id}`, 404));
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = req.files.file;

  // Make sure the file is a valid type
  if (!file.mimetype.startsWith('image') && !file.mimetype.startsWith('application/pdf')) {
    return next(new ErrorResponse(`Please upload an image or PDF file`, 400));
  }

  // Check filesize
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload a file less than ${process.env.MAX_FILE_UPLOAD / 1000000}MB`,
        400
      )
    );
  }

  // Create custom filename
  file.name = `loan_doc_${loan._id}_${Date.now()}${path.parse(file.name).ext}`;

  // Move file to upload path
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    // Add document to loan
    loan.documents.push({
      name: req.body.documentName || file.name,
      type: file.mimetype,
      url: `/uploads/${file.name}`,
      uploadedAt: Date.now()
    });
    
    await loan.save();

    res.status(200).json({
      success: true,
      data: loan.documents[loan.documents.length - 1]
    });
  });
});

// @desc    Delete loan document
// @route   DELETE /api/v1/loans/:id/documents/:docId
// @access  Private
export const deleteLoanDocument = asyncHandler(async (req, res, next) => {
  const loan = await Loan.findById(req.params.id);

  if (!loan) {
    return next(new ErrorResponse(`Loan not found with id of ${req.params.id}`, 404));
  }

  // Find document
  const document = loan.documents.id(req.params.docId);
  
  if (!document) {
    return next(new ErrorResponse(`Document not found with id of ${req.params.docId}`, 404));
  }
  
  // Delete file from server
  const filePath = path.join(__dirname, '../../public', document.url);
  
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  
  // Remove document from loan
  document.deleteOne();
  await loan.save();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Generate loan repayment schedule
// @route   POST /api/v1/loans/:id/schedule
// @access  Private
export const generateLoanSchedule = asyncHandler(async (req, res, next) => {
  const loan = await Loan.findById(req.params.id);

  if (!loan) {
    return next(new ErrorResponse(`Loan not found with id of ${req.params.id}`, 404));
  }

  if (!loan.approvedAmount || !loan.disbursedDate) {
    return next(new ErrorResponse(`Loan must be approved and disbursed to generate schedule`, 400));
  }

  // Delete existing repayments for this loan
  await Repayment.deleteMany({ loanId: loan._id });

  // Generate new repayment schedule
  const startDate = new Date(loan.disbursedDate);
  const repayments = [];

  for (let i = 1; i <= loan.period; i++) {
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i);

    const repayment = await Repayment.create({
      loanId: loan._id,
      emiNo: i,
      dueDate: dueDate,
      amount: loan.emi,
      balance: loan.emi,
      status: 'pending'
    });

    repayments.push(repayment);
  }

  res.status(200).json({
    success: true,
    count: repayments.length,
    data: repayments
  });
});