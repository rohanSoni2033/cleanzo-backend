import { Router } from 'express';
import {
  protectRoute,
  accessPermission,
} from '../controllers/authController.js';
import {
  getAllServices,
  getService,
  createService,
  updateService,
  deleteService,
} from './../controllers/serviceController.js';

const router = Router();

router.get('/', protectRoute, getAllServices);
router.post('/', protectRoute, accessPermission('admin'), createService);

router
  .route('/:id')
  .get(protectRoute, getService)
  .patch(protectRoute, accessPermission('admin'), updateService)
  .delete(protectRoute, accessPermission('admin'), deleteService);

export default router;
