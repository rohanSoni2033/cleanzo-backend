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
  const {
    name,
    mobileNumber,
    address,
    serviceId,
    vehicleModel,
    paymentStatus,
    slotId,
  } = req.body;

  // userId, serviceId, slotId must belong to users, services and slots collection respectively
  const slot = await Slot.getOneById(slotId);

  if (!slot) {
    return next(
      new GlobalError('Please provide a valid slot id', statusCode.BAD_REQUEST)
    );
  }

  if (!slot.available) {
    return next(
      new GlobalError(
        'Sorry, Unfortunately this slot is not available, please choose another',
        statusCode.BAD_REQUEST
      )
    );
  }
  // user's details -> name, mobile number, address, location
  // service details -> service name, price
  // vehicle's details -> vehicle brand, model name

  await Booking.createOne({
    userId: req.id,
    name,
    mobileNumber,
    address,
    vehicleModel,
    serviceId,
    paymentStatus,
    slotDate: slot.slotDate,
    slotTime: slot.slotTime,
    bookingStatus: BookingStatus.PENDING,
    createdAt: Date.now(),
  });

  // increment the value of total bookings in this slot
  // check if the total bookings is equal to total number slots

  await Slot.updateOneById(slotId, { available: false });

  // send sms and notification to the user
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
