import { Router } from 'express';

import {
  protectRoute,
  accessPermission,
} from '../controllers/authController.js';

import {
  getAllServicesCategories,
  getServiceCategory,
  updateServiceCategory,
  deleteServiceCategory,
} from '../controllers/serviceCategoryController.js';

const router = Router();

router.get('/', protectRoute, getAllServicesCategories);

router
  .route('/:id')
  .get(protectRoute, getServiceCategory)
  .patch(protectRoute, accessPermission('admin'), updateServiceCategory)
  .delete(protectRoute, accessPermission('admin'), deleteServiceCategory);

export default router;
