import { Router } from 'express';

import { protectRoute, verifyOTP } from '../controllers/authController.js';

import {
  getMeController,
  updateMobileNumber,
  updateUserName,
  addUserAddress,
  deleteUserAddress,
  deleteMeController,
} from '../controllers/meController.js';

import {
  getMyAllBookings,
  getMyBooking,
  deleteMyBooking,
  createMembershipBooking,
} from './../controllers/bookingController.js';

import {
  addMyVehicle,
  removeMyVehicle,
} from './../controllers/vehicleController.js';
import { getMyMemberships } from '../controllers/membershipController.js';

const router = Router();

router
  .route('/')
  .get(protectRoute, getMeController)
  .delete(protectRoute, deleteMeController);

router.patch('/name', protectRoute, updateUserName);

// address

router.post('/address', protectRoute, addUserAddress);

router.delete('/address/:addressId', protectRoute, deleteUserAddress);

// update mobile number
///////////////////////////////////////////////////////

router.patch('/mobile', protectRoute, updateMobileNumber);

router.post('/verify-otp', protectRoute, verifyOTP);

// vehicles
/////////////////////////////////////////////////////

router.post('/vehicles', protectRoute, addMyVehicle);

router.delete('/vehicles/:vehicleId', protectRoute, removeMyVehicle);

// bookings
////////////////////////////////////////////////////

router.route('/bookings').get(protectRoute, getMyAllBookings);

router
  .route('/bookings/:bookingId')
  .get(protectRoute, getMyBooking)
  .delete(protectRoute, deleteMyBooking);

router.get('/memberships', protectRoute, getMyMemberships);

router.post(
  '/memberships/:membershipId/services/:serviceId/book',
  protectRoute,
  createMembershipBooking
);

export default router;
