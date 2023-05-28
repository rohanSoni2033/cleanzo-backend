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
  getSlotBookings,
} from '../controllers/slotController.js';

const router = Router();

router
  .route('/')
  .get(protectRoute, getAllSlots)
  .post(protectRoute, accessPermission('admin', 'user'), createSlot);

router
  .route('/:id')
  .get(protectRoute, getSlot)
  .patch(protectRoute, accessPermission('admin'), updateSlot)
  .delete(protectRoute, accessPermission('admin'), deleteSlot);

router.get(
  '/:id/bookings',
  protectRoute,
  accessPermission('admin'),
  getSlotBookings
);

export default router;
