import express from 'express';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserLoginHistory,
  unlockUserAccount,
  forceLogoutUser
} from '../controllers/users.js';

import advancedResults from '../middleware/advancedResults.js';
import { protect, authorize } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Apply protection to all routes
router.use(protect);
// Apply authorization to all routes
router.use(authorize('admin'));

router.route('/')
  .get(advancedResults(User), getUsers)
  .post(createUser);

router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

router.route('/:id/login-history')
  .get(getUserLoginHistory);

router.route('/:id/unlock')
  .put(unlockUserAccount);

router.route('/:id/force-logout')
  .put(forceLogoutUser);

export default router;