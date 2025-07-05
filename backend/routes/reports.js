import express from 'express';
import {
  getDashboardReport,
  getCollectionReport,
  getLoanAnalyticsReport,
  getCustomerReport,
  getOverdueReport,
  getFinancialReport
} from '../controllers/reports.js';

import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Apply protection to all routes
router.use(protect);

router.route('/dashboard')
  .get(getDashboardReport);

router.route('/collection')
  .get(getCollectionReport);

router.route('/loan-analytics')
  .get(getLoanAnalyticsReport);

router.route('/customer')
  .get(getCustomerReport);

router.route('/overdue')
  .get(getOverdueReport);

router.route('/financial')
  .get(authorize('admin', 'officer'), getFinancialReport);

export default router;