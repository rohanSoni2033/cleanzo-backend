import asyncHandler from './../utils/asyncHandler.js';
import statusCode from './../utils/statusCode.js';
import GlobalError from '../error/GlobalError.js';
import { ObjectId } from 'mongodb';
import { MAXIMUM_BOOKING_PER_SLOT } from '../utils/constants.js';

import { Booking, Slot } from '../db/collections.js';

export const getAllBookings = asyncHandler(async (req, res, next) => {
  const bookings = await Booking.find().toArray();

  // serviceId, vehicleId, userId
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

  const booking = await Booking.findOne({ _id: new ObjectId(id) });

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
    location,
    serviceId,
    vehicleId,
    paymentStatus,
    slotId,
  } = req.body;

  const slot = await Slot.findOne({ _id: new ObjectId(slotId) });

  if (!slot) {
    return next(
      new GlobalError('Please provide a valid slot id', statusCode.BAD_REQUEST)
    );
  }

  if (!slot.available) {
    return next(
      new GlobalError('Slot is not available', statusCode.BAD_REQUEST)
    );
  }

  if (slot.bookings.length >= MAXIMUM_BOOKING_PER_SLOT) {
    await Slot.updateOneById(slot._id, { available: false });
    return next(
      new GlobalError('Slot is not available', statusCode.BAD_REQUEST)
    );
  }

  const userId = req.userId;

  const result = await Booking.insertOne({
    name,
    mobileNumber,
    address,
    location,
    userId: new ObjectId(userId),
    serviceId: new ObjectId(serviceId),
    vehicleId: new ObjectId(vehicleId),
    slotDate: slot.slotDate,
    slotTime: slot.slotTime,
    paymentStatus,
    bookingStatus: BookingStatus.PENDING,
    createdAt: Date.now(),
  });

  const booking = { bookingId: result.insertedId };

  await Slot.updateOne(
    { _id: new ObjectId(slotId) },
    { $push: { bookings: booking } }
  );

  // sending SMS and notification to the user and admin

  res.status(statusCode.CREATED).json({
    status: 'success',
  });
});

export const deleteBooking = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const result = await Booking.updateOne(
    { _id: new ObjectId(id) },
    { bookingStatus: BookingStatus.CANCELED }
  );

  if (result.matchedCount > 0 && result.modifiedCount > 0) {
    return res.status(statusCode.OK).json({
      status: 'success',
    });
  }

  res.status(statusCode.OK).json({
    status: 'fail',
    message: 'booking not found',
  });
});

export const updateBooking = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { bookingStatus, paymentStatus } = req.body;

  const result = await Booking.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        bookingStatus,
        paymentStatus,
      },
    }
  );

  if (result.matchedCount > 0 && result.modifiedCount > 0) {
    return res.status(statusCode.OK).json({
      status: 'success',
    });
  }

  res.status(statusCode.OK).json({
    status: 'fail',
    message: 'booking not found',
  });
});

export const getMyAllBookings = asyncHandler(async (req, res, next) => {
  const userId = req.userId;

  const bookings = await Booking.find({ userId }).toArray();

  res.status(statusCode.OK).json({
    status: 'success',
    data: {
      length: bookings.length,
      data: bookings,
    },
  });
});

export const getMyBooking = asyncHandler(async (req, res, next) => {
  const userId = req.userId;
  const bookingId = req.bookingId;

  const result = await Booking.findOne({
    _id: new ObjectId(bookingId),
    userId,
  });

  if (result.matchedCount > 0 && result.modifiedCount > 0) {
    return res.status(statusCode.OK).json({
      status: 'success',
    });
  }

  res.status(statusCode.OK).json({
    status: 'fail',
    message: 'booking not found',
  });
});

export const deleteMyBooking = asyncHandler(async (req, res, next) => {
  const userId = req.userId;
  const bookingId = req.params;

  const result = await Booking.updateOne(
    {
      _id: new ObjectId(bookingId),
      userId,
      bookingStatus: BookingStatus.PENDING,
    },
    { $set: { bookingStatus: BookingStatus.CANCELED } }
  );

  if (result.matchedCount > 0 && result.modifiedCount > 0) {
    return res.status(statusCode.OK).json({
      status: 'success',
    });
  }

  res.status(statusCode.OK).json({
    status: 'fail',
    message: 'booking not found',
  });
});
