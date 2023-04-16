import { Router } from 'express';
const router = Router();

import {
  getAllBookings,
  getBooking,
  updateBooking,
  deleteBooking,
  createBooking,
} from './../controllers/bookingController.js';

import {
  accessPermission,
  protectRoute,
} from '../controllers/authController.js';

router.get(
  '/',
  protectRoute,
  accessPermission('admin', 'member'),
  getAllBookings
);

router
  .route('/:id')
  .get(protectRoute, accessPermission('admin', 'member'), getBooking)
  .post(protectRoute, accessPermission('admin', 'user'), createBooking)
  .patch(protectRoute, accessPermission('admin', 'member'), updateBooking)
  .delete(protectRoute, accessPermission('admin', 'member'), deleteBooking);

// api/v1.0/users/userId/bookings
// api/v1.0/services/serviceId/bookings

// api/v1.0/bookings?slot=today
// api/v1.0/bookings?slot=tomorrow
// api/v1.0/bookings?slot=yesterday

// filter, sort, aliases, limit fields, pagination

export default router;
