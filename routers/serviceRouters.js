import { Router } from 'express';
import {
  protectRoute,
  accessPermission,
} from '../controllers/authController.js';
import {
  getAllServices,
  getService,
} from './../controllers/serviceController.js';

const router = Router();

router.get('/', protectRoute, getAllServices);

router.route('/:id').get(protectRoute, accessPermission('admin'), getService);
export default router;
