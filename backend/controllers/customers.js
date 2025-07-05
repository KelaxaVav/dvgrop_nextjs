import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../middleware/async.js';
import Customer from '../models/Customer.js';
import Loan from '../models/Loan.js';
import EmailContact from '../models/EmailContact.js';
import Setting from '../models/Setting.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Get all customers
// @route   GET /api/v1/customers
// @access  Private
export const getCustomers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single customer
// @route   GET /api/v1/customers/:id
// @access  Private
export const getCustomer = asyncHandler(async (req, res, next) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer) {
    return next(new ErrorResponse(`Customer not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: customer
  });
});

// @desc    Create new customer
// @route   POST /api/v1/customers
// @access  Private
export const createCustomer = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.createdBy = req.user.id;
  
  const customer = await Customer.create(req.body);
  
  // Check if customer should be added to email contacts
  const addToEmailList = req.body.addToEmailList;
  
  if (addToEmailList && req.body.email) {
    // Check email sync settings
    const emailSyncConfig = await Setting.findOne({ key: 'emailSyncConfig' });
    
    if (emailSyncConfig && emailSyncConfig.value.syncOnCustomerRegistration) {
      // Add to email contacts
      await EmailContact.create({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        source: 'customer_registration',
        customerId: customer._id,
        syncStatus: 'pending',
        isSubscribed: true,
        tags: ['customer', customer.occupation.toLowerCase()],
        createdBy: req.user.id
      });
    }
  }

  res.status(201).json({
    success: true,
    data: customer
  });
});

// @desc    Update customer
// @route   PUT /api/v1/customers/:id
// @access  Private
export const updateCustomer = asyncHandler(async (req, res, next) => {
  let customer = await Customer.findById(req.params.id);

  if (!customer) {
    return next(new ErrorResponse(`Customer not found with id of ${req.params.id}`, 404));
  }

  // Update customer
  customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  // Update email contact if email is updated
  if (req.body.email || req.body.name || req.body.phone) {
    const contact = await EmailContact.findOne({ customerId: customer._id });
    
    if (contact) {
      // Update existing contact
      contact.name = req.body.name || customer.name;
      contact.email = req.body.email || contact.email;
      contact.phone = req.body.phone || customer.phone;
      contact.updatedAt = Date.now();
      contact.syncStatus = 'pending';
      await contact.save();
    } else if (req.body.email) {
      // Create new contact if email is now provided
      await EmailContact.create({
        name: customer.name,
        email: req.body.email,
        phone: customer.phone,
        source: 'customer_registration',
        customerId: customer._id,
        syncStatus: 'pending',
        isSubscribed: true,
        tags: ['customer'],
        createdBy: req.user.id
      });
    }
  }

  res.status(200).json({
    success: true,
    data: customer
  });
});

// @desc    Delete customer
// @route   DELETE /api/v1/customers/:id
// @access  Private/Admin
export const deleteCustomer = asyncHandler(async (req, res, next) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer) {
    return next(new ErrorResponse(`Customer not found with id of ${req.params.id}`, 404));
  }

  // Check if customer has any loans
  const loans = await Loan.find({ customerId: customer._id });
  
  if (loans.length > 0) {
    return next(new ErrorResponse(`Cannot delete customer with active loans`, 400));
  }
  
  // Delete customer's email contact
  await EmailContact.deleteOne({ customerId: customer._id });
  
  // Delete customer
  await customer.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Upload customer document
// @route   PUT /api/v1/customers/:id/documents
// @access  Private
export const uploadCustomerDocument = asyncHandler(async (req, res, next) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer) {
    return next(new ErrorResponse(`Customer not found with id of ${req.params.id}`, 404));
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
  file.name = `doc_${customer._id}_${Date.now()}${path.parse(file.name).ext}`;

  // Move file to upload path
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    // Add document to customer
    customer.documents.push({
      name: req.body.documentName || file.name,
      type: file.mimetype,
      url: `/uploads/${file.name}`,
      uploadedAt: Date.now()
    });
    
    await customer.save();

    res.status(200).json({
      success: true,
      data: customer.documents[customer.documents.length - 1]
    });
  });
});

// @desc    Delete customer document
// @route   DELETE /api/v1/customers/:id/documents/:docId
// @access  Private
export const deleteCustomerDocument = asyncHandler(async (req, res, next) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer) {
    return next(new ErrorResponse(`Customer not found with id of ${req.params.id}`, 404));
  }

  // Find document
  const document = customer.documents.id(req.params.docId);
  
  if (!document) {
    return next(new ErrorResponse(`Document not found with id of ${req.params.docId}`, 404));
  }
  
  // Delete file from server
  const filePath = path.join(__dirname, '../../public', document.url);
  
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  
  // Remove document from customer
  document.deleteOne();
  await customer.save();

  res.status(200).json({
    success: true,
    data: {}
  });
});