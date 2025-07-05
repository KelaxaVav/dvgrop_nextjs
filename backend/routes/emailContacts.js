import express from 'express';
import {
  getEmailContacts,
  getEmailContact,
  createEmailContact,
  updateEmailContact,
  deleteEmailContact,
  syncEmailContacts,
  getEmailSyncConfig,
  updateEmailSyncConfig,
  importEmailContacts
} from '../controllers/emailContacts.js';

import advancedResults from '../middleware/advancedResults.js';
import { protect, authorize } from '../middleware/auth.js';
import EmailContact from '../models/EmailContact.js';

const router = express.Router();

// Apply protection to all routes
router.use(protect);

router.route('/')
  .get(advancedResults(EmailContact), getEmailContacts)
  .post(createEmailContact);

router.route('/:id')
  .get(getEmailContact)
  .put(updateEmailContact)
  .delete(deleteEmailContact);

router.route('/sync')
  .post(syncEmailContacts);

router.route('/sync-config')
  .get(getEmailSyncConfig)
  .put(authorize('admin'), updateEmailSyncConfig);

router.route('/import')
  .post(authorize('admin'), importEmailContacts);

export default router;