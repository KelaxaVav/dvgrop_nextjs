import express from 'express';
import {
  calculateCollectionDays,
  getLeaveDays,
  addLeaveDay,
  deleteLeaveDay
} from '../controllers/collectionDays.js';

import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Apply protection to all routes
router.use(protect);

router.route('/calculate')
  .post(calculateCollectionDays);

router.route('/leave-days')
  .get(getLeaveDays)
  .post(authorize('admin'), addLeaveDay);

router.route('/leave-days/:id')
  .delete(authorize('admin'), deleteLeaveDay);

export default router;