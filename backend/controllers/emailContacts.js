// @ts-nocheck
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../middleware/async.js';
import EmailContact from '../models/EmailContact.js';
import Setting from '../models/Setting.js';
import Customer from '../models/Customer.js';

// @desc    Get all email contacts
// @route   GET /api/v1/email-contacts
// @access  Private
export const getEmailContacts = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single email contact
// @route   GET /api/v1/email-contacts/:id
// @access  Private
export const getEmailContact = asyncHandler(async (req, res, next) => {
  const contact = await EmailContact.findById(req.params.id);

  if (!contact) {
    return next(new ErrorResponse(`Email contact not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: contact
  });
});

// @desc    Create new email contact
// @route   POST /api/v1/email-contacts
// @access  Private
export const createEmailContact = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.createdBy = req.user.id;
  
  // Check for duplicate email
  const existingContact = await EmailContact.findOne({ email: req.body.email });
  
  if (existingContact) {
    return next(new ErrorResponse(`Email ${req.body.email} is already in the contact list`, 400));
  }
  
  const contact = await EmailContact.create(req.body);

  res.status(201).json({
    success: true,
    data: contact
  });
});

// @desc    Update email contact
// @route   PUT /api/v1/email-contacts/:id
// @access  Private
export const updateEmailContact = asyncHandler(async (req, res, next) => {
  let contact = await EmailContact.findById(req.params.id);

  if (!contact) {
    return next(new ErrorResponse(`Email contact not found with id of ${req.params.id}`, 404));
  }

  // Check for duplicate email if email is being changed
  if (req.body.email && req.body.email !== contact.email) {
    const existingContact = await EmailContact.findOne({ email: req.body.email });
    
    if (existingContact) {
      return next(new ErrorResponse(`Email ${req.body.email} is already in the contact list`, 400));
    }
  }

  // Update contact
  contact = await EmailContact.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: contact
  });
});

// @desc    Delete email contact
// @route   DELETE /api/v1/email-contacts/:id
// @access  Private
export const deleteEmailContact = asyncHandler(async (req, res, next) => {
  const contact = await EmailContact.findById(req.params.id);

  if (!contact) {
    return next(new ErrorResponse(`Email contact not found with id of ${req.params.id}`, 404));
  }

  await contact.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Sync email contacts
// @route   POST /api/v1/email-contacts/sync
// @access  Private
export const syncEmailContacts = asyncHandler(async (req, res, next) => {
  // Get email sync config
  const emailSyncConfig = await Setting.findOne({ key: 'emailSyncConfig' });
  
  if (!emailSyncConfig || !emailSyncConfig.value.enabled) {
    return next(new ErrorResponse('Email sync is not enabled in settings', 400));
  }
  
  // Get pending contacts
  const pendingContacts = await EmailContact.find({ syncStatus: 'pending' });
  
  if (pendingContacts.length === 0) {
    return res.status(200).json({
      success: true,
      message: 'No pending contacts to sync',
      data: { success: 0, failed: 0 }
    });
  }
  
  // In a real implementation, this would connect to an external email service
  // For this demo, we'll simulate the sync process
  let success = 0;
  let failed = 0;
  
  for (const contact of pendingContacts) {
    try {
      // Simulate 90% success rate
      if (Math.random() > 0.1) {
        contact.syncStatus = 'synced';
        contact.lastSyncedAt = new Date();
        success++;
      } else {
        contact.syncStatus = 'failed';
        failed++;
      }
      
      await contact.save();
    } catch (error) {
      failed++;
    }
  }
  
  // Update sync config with last sync time
  emailSyncConfig.value.lastSyncAt = new Date().toISOString();
  await emailSyncConfig.save();
  
  res.status(200).json({
    success: true,
    message: `Synced ${success} contacts, ${failed} failed`,
    data: { success, failed }
  });
});

// @desc    Get email sync config
// @route   GET /api/v1/email-contacts/sync-config
// @access  Private
export const getEmailSyncConfig = asyncHandler(async (req, res, next) => {
  let emailSyncConfig = await Setting.findOne({ key: 'emailSyncConfig' });
  
  if (!emailSyncConfig) {
    // Create default config if not found
    emailSyncConfig = await Setting.create({
      key: 'emailSyncConfig',
      value: {
        enabled: true,
        provider: 'internal',
        syncOnCustomerRegistration: true,
        syncOnLoanApproval: true
      },
      group: 'notification',
      updatedBy: req.user.id
    });
  }

  res.status(200).json({
    success: true,
    data: emailSyncConfig.value
  });
});

// @desc    Update email sync config
// @route   PUT /api/v1/email-contacts/sync-config
// @access  Private/Admin
export const updateEmailSyncConfig = asyncHandler(async (req, res, next) => {
  const config = req.body;

  if (!config) {
    return next(new ErrorResponse('No configuration provided', 400));
  }

  let emailSyncConfig = await Setting.findOne({ key: 'emailSyncConfig' });
  
  if (!emailSyncConfig) {
    // Create new config
    emailSyncConfig = await Setting.create({
      key: 'emailSyncConfig',
      value: config,
      group: 'notification',
      updatedBy: req.user.id
    });
  } else {
    // Update existing config
    emailSyncConfig.value = config;
    emailSyncConfig.updatedBy = req.user.id;
    emailSyncConfig.updatedAt = Date.now();
    await emailSyncConfig.save();
  }

  res.status(200).json({
    success: true,
    data: emailSyncConfig.value
  });
});

// @desc    Import email contacts from CSV
// @route   POST /api/v1/email-contacts/import
// @access  Private/Admin
export const importEmailContacts = asyncHandler(async (req, res, next) => {
  if (!req.files || !req.files.file) {
    return next(new ErrorResponse('Please upload a CSV file', 400));
  }
  
  const file = req.files.file;
  
  // Check if file is CSV
  if (file.mimetype !== 'text/csv') {
    return next(new ErrorResponse('Please upload a CSV file', 400));
  }
  
  // Process CSV file
  const csv = file.data.toString('utf8');
  const lines = csv.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  // Find column indices
  const nameIndex = headers.findIndex(h => h.toLowerCase() === 'name');
  const emailIndex = headers.findIndex(h => h.toLowerCase() === 'email');
  const phoneIndex = headers.findIndex(h => h.toLowerCase() === 'phone');
  
  if (nameIndex === -1 || emailIndex === -1) {
    return next(new ErrorResponse('CSV file must contain at least Name and Email columns', 400));
  }
  
  const results = {
    total: 0,
    added: 0,
    updated: 0,
    failed: 0,
    errors: []
  };
  
  // Process each line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    results.total++;
    
    try {
      // Split by comma, respecting quotes
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      
      if (values.length >= Math.max(nameIndex, emailIndex) + 1) {
        const name = values[nameIndex];
        const email = values[emailIndex];
        const phone = phoneIndex !== -1 ? values[phoneIndex] : '';
        
        if (!name || !email) {
          results.failed++;
          results.errors.push(`Line ${i}: Missing name or email`);
          continue;
        }
        
        // Check if email already exists
        const existingContact = await EmailContact.findOne({ email });
        
        if (existingContact) {
          // Update existing contact
          existingContact.name = name;
          if (phone) existingContact.phone = phone;
          existingContact.syncStatus = 'pending';
          existingContact.updatedAt = Date.now();
          await existingContact.save();
          
          results.updated++;
        } else {
          // Add new contact
          await EmailContact.create({
            name,
            email,
            phone: phone || 'N/A',
            source: 'manual_entry',
            syncStatus: 'pending',
            isSubscribed: true,
            tags: ['imported'],
            createdBy: req.user.id
          });
          
          results.added++;
        }
      } else {
        results.failed++;
        results.errors.push(`Line ${i}: Not enough columns`);
      }
    } catch (error) {
      results.failed++;
      results.errors.push(`Line ${i}: ${error.message}`);
    }
  }
  
  res.status(200).json({
    success: true,
    data: results
  });
});