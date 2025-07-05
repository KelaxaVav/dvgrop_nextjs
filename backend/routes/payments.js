import express from 'express';
import {
  getRepayments,
  getRepayment,
  createRepayment,
  updateRepayment,
  processBulkPayments,
  getDailyPayments,
  getOverduePayments
} from '../controllers/payments.js';

import advancedResults from '../middleware/advancedResults.js';
import { protect, authorize } from '../middleware/auth.js';
import Repayment from '../models/Repayment.js';

const router = express.Router({ mergeParams: true });

// Apply protection to all routes
router.use(protect);

router.route('/')
  .get(advancedResults(Repayment, [
    { 
      path: 'loanId', 
      select: 'customerId type period emi',
      populate: { path: 'customerId', select: 'name phone' }
    },
    { path: 'processedBy', select: 'name' }
  ]), getRepayments)
  .post(createRepayment);

router.route('/bulk')
  .post(processBulkPayments);

router.route('/daily/:date?')
  .get(getDailyPayments);

router.route('/overdue')
  .get(getOverduePayments);

router.route('/:id')
  .get(getRepayment)
  .put(updateRepayment);

export default router;