import asyncHandler from './../utils/asyncHandler.js';
import statusCode from './../utils/statusCode.js';
import GlobalError from '../error/GlobalError.js';
import { ObjectId } from 'mongodb';
import { MAXIMUM_BOOKING_PER_SLOT } from '../utils/constants.js';
import { BookingStatus } from '../utils/constants.js';

import { Booking, Service, Slot, Vehicle } from '../db/collections.js';

export const getAllBookings = asyncHandler(async (req, res, next) => {
  const bookings = await Booking.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
      },
    },
    {
      $project: {
        _id: 1,
        slotTime: 1,
        slotDate: 1,
        name: 1,
        mobileNumber: 1,
        address: 1,
        location: 1,
        paymentStatus: 1,
        user: {
          $arrayElemAt: ['$user', 0],
        },
        service: 1,
        vehicle: 1,
        createdAt: 1,
      },
    },
    {
      $project: {
        _id: 1,
        slotTime: 1,
        slotDate: 1,
        name: 1,
        mobileNumber: 1,
        address: 1,
        location: 1,
        paymentStatus: 1,
        user: {
          name: 1,
          mobileNumber: 1,
          address: 1,
          location: 1,
        },
        service: 1,
        vehicle: 1,
        createdAt: 1,
      },
    },
  ]).toArray();

  res.status(statusCode.OK).json({
    status: 'success',
    ok: true,
    data: {
      length: bookings.length,
      data: bookings,
    },
  });
});

export const getBooking = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const booking = await Booking.findOne({ _id: new ObjectId(id) });

  res.status(statusCode.OK).json({
    status: 'success',
    ok: true,
    data: booking,
  });
});

export const createBooking = asyncHandler(async (req, res, next) => {
  const {
    name,
    mobileNumber,
    address,
    location,
    paymentStatus,
    slotId,
    serviceId,
    vehicleId,
  } = req.body;

  const slot = await Slot.findOne({ _id: new ObjectId(slotId) });

  if (!slot) {
    return next(
      new GlobalError('Please provide a valid slot id', statusCode.BAD_REQUEST)
    );
  }

  if (!slot.available || slot.timestamp <= Date.now()) {
    return next(
      new GlobalError('Slot is not available', statusCode.BAD_REQUEST)
    );
  }

  if (slot.bookings.length >= MAXIMUM_BOOKING_PER_SLOT) {
    await Slot.updateOne(
      { _id: new ObjectId(slot._id) },
      {
        $set: { available: false },
      }
    );
    return next(
      new GlobalError('Slot is not available', statusCode.BAD_REQUEST)
    );
  }

  const slotDate = new Date(slot.timestamp).toLocaleDateString();
  const slotTime = new Date(slot.timestamp).toLocaleTimeString();

  const userId = req.userId;

  const serviceResult = await Service.findOne({ _id: new ObjectId(serviceId) });

  if (!serviceResult) {
    return next(new GlobalError('service not found', statusCode.NOT_FOUND));
  }

  const { serviceName, serviceBasePrice } = serviceResult;

  const vehicleResult = await Vehicle.findOne({ _id: new ObjectId(vehicleId) });

  if (!vehicleResult) {
    return next(new GlobalError('vehicle not found', statusCode.NOT_FOUND));
  }

  const { brand, model, logo, additionalServicePrice } = vehicleResult;

  const result = await Booking.insertOne({
    name,
    mobileNumber,
    address,
    location,
    userId: new ObjectId(userId),
    service: {
      serviceName,
      serviceBasePrice,
    },
    vehicle: {
      brand,
      model,
      logo,
      additionalServicePrice,
    },
    slotDate,
    slotTime,
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
    ok: true,
  });
});

export const deleteBooking = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const result = await Booking.updateOne(
    { _id: new ObjectId(id) },
    { $set: { bookingStatus: BookingStatus.CANCELED } }
  );

  if (result.matchedCount > 0 && result.modifiedCount > 0) {
    return res.status(statusCode.OK).json({
      status: 'success',
    });
  }

  res.status(statusCode.OK).json({
    status: 'fail',
    ok: true,
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
    ok: true,
    message: 'booking not found',
  });
});

export const getMyAllBookings = asyncHandler(async (req, res, next) => {
  const userId = req.userId;

  const bookings = await Booking.find(
    {
      userId: new ObjectId(userId),
    },
    { projection: { userId: 0 } }
  )
    .sort({ createdAt: 1 })
    .toArray();

  res.status(statusCode.OK).json({
    status: 'success',
    ok: true,
    data: {
      length: bookings.length,
      data: bookings,
    },
  });
});

export const getMyBooking = asyncHandler(async (req, res, next) => {
  const userId = req.userId;
  const bookingId = req.params.bookingId;

  const result = await Booking.findOne(
    {
      _id: new ObjectId(bookingId),
      userId: new ObjectId(userId),
    },
    { projection: { userId: 0 } }
  );

  if (!result) {
    return next(new GlobalError('booking not found', statusCode.NOT_FOUND));
  }

  res.status(statusCode.OK).json({
    status: 'success',
    ok: true,
    data: result,
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
    ok: true,
    message: 'booking not found',
  });
});
