import { Router } from 'express';
import {
  protectRoute,
  accessPermission,
} from '../controllers/authController.js';

import {
  getAllServiceGroups,
  getServiceGroup,
  updateServiceGroup,
  deleteServiceGroup,
} from '../controllers/serviceGroupController.js';

const router = Router();

router.get('/', protectRoute, getAllServiceGroups);

router
  .route('/:id')
  .get(protectRoute, getServiceGroup)
  .patch(protectRoute, accessPermission('admin'), getServiceGroup)
  .delete(protectRoute, accessPermission('admin'), deleteServiceGroup);

export default router;
