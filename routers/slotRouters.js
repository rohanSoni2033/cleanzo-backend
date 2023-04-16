import { Router } from 'express';

import {
  protectRoute,
  accessPermission,
} from '../controllers/authController.js';

import {
  createSlot,
  deleteSlot,
  getAllSlots,
  getSlot,
  updateSlot,
} from '../controllers/slotController.js';

const router = Router();

router.get('/', protectRoute, getAllSlots);
router.post('/', protectRoute, accessPermission('admin'), createSlot);
router
  .route('/:id')
  .get(protectRoute, getSlot)
  .delete(protectRoute, accessPermission('admin'), deleteSlot)
  .patch(protectRoute, accessPermission('admin'), updateSlot);

export default router;
