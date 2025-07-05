import express from 'express';
import {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  uploadCustomerDocument,
  deleteCustomerDocument
} from '../controllers/customers.js';

import advancedResults from '../middleware/advancedResults.js';
import { protect, authorize } from '../middleware/auth.js';
import Customer from '../models/Customer.js';

// Include loan router
import loanRouter from './loans.js';

const router = express.Router();

// Re-route into other resource routers
router.use('/:customerId/loans', loanRouter);

// Apply protection to all routes
router.use(protect);

router.route('/')
  .get(advancedResults(Customer), getCustomers)
  .post(createCustomer);

router.route('/:id')
  .get(getCustomer)
  .put(updateCustomer)
  .delete(authorize('admin'), deleteCustomer);

router.route('/:id/documents')
  .put(uploadCustomerDocument);

router.route('/:id/documents/:docId')
  .delete(deleteCustomerDocument);

export default router;