import { Router } from 'express';
import {
  getAllMembershipPlans,
  getMembershipPlan,
  deleteMembershipPlan,
  updateMembershipPlan,
} from '../controllers/membershipPlanController.js';

import {
  accessPermission,
  protectRoute,
} from './../controllers/authController.js';

const router = Router();

router.get('/', protectRoute, getAllMembershipPlans);

router
  .get('/:id')
  .get(protectRoute, accessPermission('admin'), getMembershipPlan)
  .delete(protectRoute, accessPermission('admin'), deleteMembershipPlan)
  .patch(protectRoute, accessPermission('admin'), updateMembershipPlan);

export default router;
