import { Router } from 'express';
import {
  createMembership,
  getAllMemberships,
  getMembershipOrderId,
} from '../controllers/membershipController.js';

import {
  accessPermission,
  protectRoute,
} from '../controllers/authController.js';

const router = Router();

router.get('/', protectRoute, accessPermission('admin'), getAllMemberships);
router.post('/', protectRoute, createMembership);

// router
//   .route('/:id')
//   .get(protectRoute, accessPermission('admin'), getMembership)
//   .delete(protectRoute, accessPermission('admin', deleteMembership))
//   .update(protectRoute, accessPermission('admin'), updateMembership);

router.get('/order-id', protectRoute, getMembershipOrderId);

export default router;
