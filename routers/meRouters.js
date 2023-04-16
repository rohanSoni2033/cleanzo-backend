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
} from '../controllers/meController.js';

const router = Router();

router
  .route('/')
  .get(protectRoute, accessPermission('user', 'admin', 'team'), getMeController)
  .patch(
    protectRoute,
    accessPermission('user', 'admin', 'team'),
    updateMeController
  )
  .delete(protectRoute, accessPermission('user'), deleteMeController);

router
  .route('/mobile-number')
  .patch(protectRoute, accessPermission('user'), updateMobileNumber);

router
  .route('/verify-otp')
  .post(protectRoute, accessPermission('user'), verifyOTPController);

export default router;
