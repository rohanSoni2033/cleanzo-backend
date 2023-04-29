import { Router } from 'express';

import {
  protectRoute,
  accessPermission,
  verifyOTPController,
} from '../controllers/authController.js';

import {
  updateMeController,
  deleteMeController,
  getMeController,
  updateMobileNumber,
} from '../controllers/meController.js';

import {
  getMyAllBookings,
  getMyBooking,
  deleteMyBooking,
} from './../controllers/bookingController.js';

import {
  removeMyVehicle,
  addMyVehicle,
  getMyVehicles,
} from './../controllers/vehicleController.js';

// import {
//   getMyAllMemberships,
//   getMyMembership,
//   deleteMyMembership,
//   updateMyMembership,
// } from './../controllers/membershipController.js';
// import { createMembershipBooking } from '../controllers/membershipBookingController.js';

const router = Router();

router
  .route('/')
  .get(protectRoute, accessPermission('admin', 'user'), getMeController)
  .patch(protectRoute, accessPermission('admin', 'user'), updateMeController)
  .delete(protectRoute, accessPermission('admin', 'user'), deleteMeController);

// update mobile number
///////////////////////////////////////////////////////

router
  .route('/mobile-number')
  .patch(protectRoute, accessPermission('admin', 'user'), updateMobileNumber);

router
  .route('/verify-otp')
  .post(protectRoute, accessPermission('admin', 'user'), verifyOTPController);

// vehicles
/////////////////////////////////////////////////////

router
  .route('/vehicles')
  .get(protectRoute, accessPermission('admin', 'user'), getMyVehicles)
  .post(protectRoute, accessPermission('admin', 'user'), addMyVehicle);

router.delete('/vehicles/:vehicleId', protectRoute, removeMyVehicle);

// bookings
////////////////////////////////////////////////////

router
  .route('/bookings')
  .get(protectRoute, accessPermission('admin', 'user'), getMyAllBookings);

router
  .route('/bookings/:bookingId')
  .get(protectRoute, accessPermission('admin', 'user'), getMyBooking)
  .delete(protectRoute, accessPermission('admin', 'user'), deleteMyBooking);

// memberships
/////////////////////////////////////////////////////

// router
//   .route('/memberships')
//   .get(protectRoute, accessPermission('admin', 'user'), getMyAllMemberships);

// router
//   .route('/memberships/:membershipId')
//   .get(protectRoute, accessPermission('admin', 'user'), getMyMembership)
//   .delete(protectRoute, accessPermission('admin', 'user'), deleteMyMembership)
//   .patch(protectRoute, accessPermission('admin', 'user'), updateMyMembership);

// router
//   .route('/memberships/:membershipId/services/:serviceId/book')
//   .post(
//     protectRoute,
//     accessPermission('admin', 'user'),
//     createMembershipBooking
//   );

export default router;
