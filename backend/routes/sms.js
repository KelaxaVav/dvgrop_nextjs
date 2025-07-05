import express from 'express';
import {
  getSmsLogs,
  getCustomerSmsLogs,
  sendSmsMessage,
  sendBulkSms,
  getSmsTemplates,
  updateSmsTemplates,
  getPendingNotifications
} from '../controllers/sms.js';

import advancedResults from '../middleware/advancedResults.js';
import { protect, authorize } from '../middleware/auth.js';
import SmsLog from '../models/SmsLog.js';

const router = express.Router();

// Apply protection to all routes
router.use(protect);

router.route('/logs')
  .get(advancedResults(SmsLog), getSmsLogs);

router.route('/logs/customer/:customerId')
  .get(getCustomerSmsLogs);

router.route('/send')
  .post(sendSmsMessage);

router.route('/send-bulk')
  .post(sendBulkSms);

router.route('/templates')
  .get(getSmsTemplates)
  .put(authorize('admin'), updateSmsTemplates);

router.route('/pending-notifications')
  .get(getPendingNotifications);

export default router;