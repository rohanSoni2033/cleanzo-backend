import asyncHandler from './../utils/asyncHandler.js';
import statusCode from './../utils/statusCode.js';
import Booking from './../models/Booking.js';
import Slot from '../models/Slot.js';
import GlobalError from '../error/GlobalError.js';

const BookingStatus = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELED: 'canceled',
};

export const getAllBookings = asyncHandler(async (req, res, next) => {
  // api/v1.0/bookings?bookingDate=today&bookingStatus=pending
  const bookings = await Booking.getAll();
  res.status(statusCode.OK).json({
    status: 'success',
    data: {
      length: bookings.length,
      bookings,
    },
  });
});

export const getBooking = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const booking = await Booking.getOneById(id);
  res.status(statusCode.OK).json({
    status: 'success',
    data: booking,
  });
});

export const createBooking = asyncHandler(async (req, res, next) => {
  const { userId, serviceId, vehicleModel, paymentStatus, slotId } = req.body;

  // userId, serviceId, slotId must belong to users, services and slots collection respectively
  const slot = await Slot.getOneById(slotId);

  if (!slot.isAvailable) {
    next(
      new GlobalError(
        'Sorry, Unfortunately this slot is not available, please choose another',
        statusCode.BAD_REQUEST
      )
    );
  }
  // increment the value of total bookings in this slot
  // check if the total bookings is equal to total number employee

  await Slot.updateOneById(slotId, { isAvailable: false });

  // name, mobile number, address, location,
  const id = await Booking.createOne({
    name,
    mobileNumber,
    address,
    location,
    serviceId,
    vehicleModel,
    paymentStatus,
    slotDate: slot.slotDate,
    slotTime: slot.slotTime,
    bookingStatus: BookingStatus.PENDING,
    createdAt: Date.now(),
  });

  res.status(statusCode.CREATED).json({
    status: 'success',
  });
});

export const deleteBooking = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  Booking.updateOneById(id, { bookingStatus: BookingStatus.CANCELED });

  res.status(statusCode.OK).json({
    status: 'success',
  });
});

export const updateBooking = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { bookingStatus, paymentStatus } = req.body;

  await Booking.updateOneById(id, { bookingStatus, paymentStatus });
});

export const getUserBookings = asyncHandler(async (req, res, next) => {
  const { id } = req;
  const results = await Booking.getAll({ userId: id });

  res.status(statusCode.OK).json({
    status: 'success',
    data: {
      length: results.length,
      data: results,
    },
  });
});
