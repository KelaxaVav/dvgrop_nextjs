import express from 'express';
import {
  getSettings,
  getSettingsByGroup,
  updateSettings,
  getLeaveDays,
  addLeaveDay,
  deleteLeaveDay,
  calculateCollectionDays
} from '../controllers/settings.js';

import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Apply protection to all routes
router.use(protect);

router.route('/')
  .get(authorize('admin'), getSettings);

router.route('/:group')
  .get(authorize('admin'), getSettingsByGroup)
  .put(authorize('admin'), updateSettings);

router.route('/leave-days')
  .get(getLeaveDays)
  .post(authorize('admin'), addLeaveDay);

router.route('/leave-days/:id')
  .delete(authorize('admin'), deleteLeaveDay);

router.route('/collection-days/calculate')
  .post(calculateCollectionDays);

export default router;