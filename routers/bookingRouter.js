import { Router } from 'express';
const router = Router();

import {
  getAllBookings,
  getBooking,
  updateBooking,
  deleteBooking,
  createBooking,
  generateBookingOrderId,
} from './../controllers/bookingController.js';

import {
  accessPermission,
  protectRoute,
} from '../controllers/authController.js';

router
  .get('/', protectRoute, accessPermission('admin', 'user'), getAllBookings)
  .post('/', protectRoute, createBooking);

router.get('/order-id', protectRoute, generateBookingOrderId);

router
  .route('/:bookingId')
  .get(protectRoute, accessPermission('admin', 'user'), getBooking)
  .patch(protectRoute, accessPermission('admin'), updateBooking)
  .delete(protectRoute, accessPermission('admin'), deleteBooking);

export default router;
