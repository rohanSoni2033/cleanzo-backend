import { Router } from 'express';

import {
  protectRoute,
  accessPermission,
} from '../controllers/authController.js';

import {
  getAllServicesCategories,
  getServiceCategory,
} from '../controllers/serviceCategoryController.js';

const router = Router();

router.get('/', protectRoute, getAllServicesCategories);

router
  .route('/:id')
  .get(protectRoute, accessPermission('admin'), getServiceCategory);

export default router;
