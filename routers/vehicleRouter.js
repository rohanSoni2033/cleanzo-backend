import { Router } from 'express';
import {
  protectRoute,
  accessPermission,
} from '../controllers/authController.js';
import {
  deleteVehicle,
  updateVehicle,
  getAllVehicles,
  getVehicle,
} from '../controllers/VehicleController.js';

const router = Router();

router.get('/', protectRoute, getAllVehicles);
router
  .route('/:id')
  .get(protectRoute, getVehicle)
  .delete(protectRoute, accessPermission('admin'), deleteVehicle)
  .patch(protectRoute, accessPermission('admin'), updateVehicle);

export default router;
