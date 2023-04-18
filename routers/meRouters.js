import { Router } from 'express';

import {
  protectRoute,
  accessPermission,
  verifyOTPController,
} from '../controllers/authController.js';

import {
  updateMeController,
  deleteMeController,
  getMeController,
  updateMobileNumber,
  getMyBookings,
} from '../controllers/meController.js';

const router = Router();

router
  .route('/')
  .get(protectRoute, accessPermission('user', 'admin'), getMeController)
  .patch(protectRoute, accessPermission('user', 'admin'), updateMeController)
  .delete(protectRoute, accessPermission('user', 'admin'), deleteMeController);

router
  .route('/mobile-number')
  .patch(protectRoute, accessPermission('user'), updateMobileNumber);

router
  .route('/verify-otp')
  .post(protectRoute, accessPermission('user'), verifyOTPController);

router.get(
  '/bookings',
  protectRoute,
  accessPermission('user', 'admin'),
  getMyBookings
);

export default router;
