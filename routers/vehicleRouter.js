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
  createVehicle,
} from '../controllers/vehicleController.js';

const router = Router();

router.get('/', protectRoute, getAllVehicles);
router.post('/', accessPermission('admin'), createVehicle);
router
  .route('/:id')
  .get(protectRoute, getVehicle)
  .delete(protectRoute, accessPermission('admin'), deleteVehicle)
  .patch(protectRoute, accessPermission('admin'), updateVehicle);

export default router;
