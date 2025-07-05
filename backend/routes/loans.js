import express from 'express';
import {
  getLoans,
  getLoan,
  createLoan,
  updateLoan,
  deleteLoan,
  uploadLoanDocument,
  deleteLoanDocument,
  generateLoanSchedule
} from '../controllers/loans.js';

import advancedResults from '../middleware/advancedResults.js';
import { protect, authorize } from '../middleware/auth.js';
import Loan from '../models/Loan.js';

// Include payment router
import paymentRouter from './payments.js';

const router = express.Router({ mergeParams: true });

// Re-route into other resource routers
router.use('/:loanId/payments', paymentRouter);

// Apply protection to all routes
router.use(protect);

router.route('/')
  .get(advancedResults(Loan, [
    { path: 'customerId', select: 'name nic phone' },
    { path: 'approvedBy', select: 'name' },
    { path: 'disbursedBy', select: 'name' },
    { path: 'createdBy', select: 'name' }
  ]), getLoans)
  .post(createLoan);

router.route('/:id')
  .get(getLoan)
  .put(updateLoan)
  .delete(authorize('admin'), deleteLoan);

router.route('/:id/documents')
  .put(uploadLoanDocument);

router.route('/:id/documents/:docId')
  .delete(deleteLoanDocument);

router.route('/:id/schedule')
  .post(authorize('admin', 'officer'), generateLoanSchedule);

export default router;