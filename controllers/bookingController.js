import asyncHandler from './../utils/asyncHandler.js';
import statusCode from './../utils/statusCode.js';
import GlobalError from '../error/GlobalError.js';
import { ObjectId } from 'mongodb';
import crypto from 'node:crypto';

import {
  Booking,
  Service,
  Slot,
  Vehicle,
  Membership,
  Payments,
} from '../db/collections.js';

import {
  MAXIMUM_BOOKING_PER_SLOT,
  PAYMENT_STATUS,
  PAYMENT_TYPE,
  BOOKING_STATUS,
  CANCEL_BOOKING_BEFORE_TIME,
} from '../utils/constants.js';

import Razorpay from 'razorpay';
import {} from '../db/collections.js';

export const getAllBookings = asyncHandler(async (req, res, next) => {
  const { bookingStatus } = req.query;

  const filter = bookingStatus ? { bookingStatus } : {};

  const bookings = await Booking.find(filter)
    .sort({
      slotTime: 1,
    })
    .toArray();

  bookings.forEach(booking => {
    const slotTime = new Date(booking.slotTime);
    slotTime.setMinutes(slotTime.getMinutes() - 1);

    if (slotTime.bookingStatus === BOOKING_STATUS.COMPLETED) {
      booking.cancelable = false;
    }
    if (new Date().getTime() > slotTime.getTime()) {
      booking.cancelable = false;
    } else {
      booking.cancelable = true;
    }
  });

  res.status(statusCode.OK).json({
    status: 'success',
    ok: true,
    content: true,
    data: bookings,
  });
});

const razorpay = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,
});

export const getBooking = asyncHandler(async (req, res, next) => {
  const { bookingId } = req.params;

  const booking = await Booking.findOne({ _id: new ObjectId(bookingId) });

  res.status(statusCode.OK).json({
    status: 'success',
    ok: true,
    content: true,
    data: booking,
  });
});

// api/v1.0/bookings?serviceId={serviceId}&vehicleId={vehicleId}
export const generateBookingOrderId = asyncHandler(async (req, res, next) => {
  const { serviceId, vehicleId } = req.query;

  if (!serviceId || !vehicleId) {
    return next(
      new GlobalError(
        'Please provide all the required fields',
        statusCode.BAD_REQUEST
      )
    );
  }

  const service = await Service.findOne(
    { _id: new ObjectId(serviceId) },
    {
      projection: {
        serviceBasePrice: 1,
      },
    }
  );

  if (!service) {
    return next(new GlobalError('service not found', statusCode.NOT_FOUND));
  }

  const vehicle = await Vehicle.findOne(
    { _id: new ObjectId(vehicleId) },
    {
      projection: {
        additionalServicePrice: 1,
      },
    }
  );

  if (!vehicle) {
    return next(new GlobalError('vehicle not found', statusCode.NOT_FOUND));
  }

  const totalPrice = service.serviceBasePrice + vehicle.additionalServicePrice;

  const { _id: userId } = req.user;

  const order = await razorpay.orders.create({
    amount: totalPrice * 100,
    currency: 'INR',
    receipt: crypto.randomUUID(),
    notes: {
      serviceId,
      vehicleId,
      userId,
    },
  });

  res.status(statusCode.OK).json({
    status: 'success',
    ok: true,
    content: true,
    data: {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    },
  });
});

export const createBooking = asyncHandler(async (req, res, next) => {
  const { addressId, onlinePayment, slotId } = req.body;

  const bookingObject = {};

  if (!addressId || !slotId || onlinePayment === undefined) {
    return next(
      new GlobalError(
        'Please provide all the required fields',
        statusCode.BAD_REQUEST
      )
    );
  }

  const address = req.user.addresses.find(add => {
    return add.id.toString() === addressId;
  });

  if (!address) {
    return next(new GlobalError('address not found', statusCode.BAD_REQUEST));
  }

  bookingObject.address = address;

  const slot = await Slot.findOne({ _id: new ObjectId(slotId) });

  if (!slot) {
    return next(
      new GlobalError('Please provide a valid slot id', statusCode.BAD_REQUEST)
    );
  }

  if (!slot.available || slot.slotTime <= new Date()) {
    return next(
      new GlobalError('Slot is not available', statusCode.BAD_REQUEST)
    );
  }

  bookingObject.slotTime = slot.slotTime;

  let userSelectedServiceId, userSelectedVehicleId;

  if (onlinePayment) {
    const { paymentId } = req.body;

    const payment = await Payments.findOne({
      paymentId,
    });

    if (payment) {
      return next(
        new GlobalError(
          'payment id is already used',
          statusCode.PAYMENT_REQUIRED
        )
      );
    }

    if (!paymentId) {
      return next(
        new GlobalError(
          'Please provide all the required fields',
          statusCode.BAD_REQUEST
        )
      );
    }

    const paymentDetails = await razorpay.payments.fetch(paymentId);

    if (!paymentDetails) {
      return next(new GlobalError('payment not found', statusCode.NOT_FOUND));
    }

    const { notes, method, vpa, email, contact, order_id } = paymentDetails;

    const bookingPaymentId = await Payments.insertOne({
      paymentId,
      method,
      vpa,
      email,
      contact,
      order_id,
      userId: req.user._id,
      createdAt: new Date(),
    });

    const { serviceId, vehicleId } = notes;

    userSelectedServiceId = serviceId;
    userSelectedVehicleId = vehicleId;

    bookingObject.payment = PAYMENT_TYPE.ONLINE;
    bookingObject.paymentStatus = PAYMENT_STATUS.PAID;
    bookingObject.paymentId = bookingPaymentId;
  } else {
    const { serviceId, vehicleId } = req.body;
    userSelectedServiceId = serviceId;
    userSelectedVehicleId = vehicleId;

    bookingObject.payment = PAYMENT_TYPE.OFFLINE;
    bookingObject.paymentStatus = PAYMENT_STATUS.NOT_PAID;
  }

  if (!userSelectedServiceId || !userSelectedVehicleId) {
    return next(
      new GlobalError(
        'Please provide all the required fields',
        statusCode.BAD_REQUEST
      )
    );
  }

  const service = await Service.findOne(
    {
      _id: new ObjectId(userSelectedServiceId),
    },
    {
      projection: {
        serviceName: 1,
        serviceBasePrice: 1,
        serviceImageUrl: 1,
        durationOfService: 1,
      },
    }
  );

  if (!service) {
    return next(new GlobalError('service not found', statusCode.NOT_FOUND));
  }

  const { serviceName, serviceBasePrice, serviceImageUrl, durationOfService } =
    service;

  const vehicle = await Vehicle.findOne({
    _id: new ObjectId(userSelectedVehicleId),
  });

  if (!vehicle) {
    return next(new GlobalError('vehicle not found', statusCode.NOT_FOUND));
  }
  const { model, logo, additionalServicePrice } = vehicle;

  bookingObject.serviceName = serviceName;
  bookingObject.serviceBasePrice = serviceBasePrice;
  bookingObject.serviceImageUrl = serviceImageUrl;
  bookingObject.durationOfService = durationOfService;

  bookingObject.model = model;
  bookingObject.logo = logo;
  bookingObject.additionalServicePrice = additionalServicePrice;

  const user = req.user;

  bookingObject.user = {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    mobile: user.mobile,
  };

  bookingObject.totalPrice = serviceBasePrice + additionalServicePrice;
  bookingObject.bookingStatus = BOOKING_STATUS.PENDING;
  bookingObject.createdAt = new Date();

  const { insertedId } = await Booking.insertOne(bookingObject);

  const slotUpdateObject = {
    $push: {
      bookings: {
        bookingId: insertedId,
      },
    },
  };

  if (slot.bookings.length + 1 >= MAXIMUM_BOOKING_PER_SLOT) {
    slotUpdateObject.$set = { available: false };
  }

  await Slot.updateOne({ _id: new ObjectId(slotId) }, slotUpdateObject);

  // sending SMS and notification to the user and admin

  res.status(statusCode.CREATED).json({
    status: 'success',
    ok: true,
    content: false,
  });
});

export const updateBooking = asyncHandler(async (req, res, next) => {
  const { bookingId } = req.params;

  const { bookingStatus, paymentStatus } = req.body;

  const result = await Booking.updateOne(
    { _id: new ObjectId(bookingId) },
    {
      $set: {
        bookingStatus,
        paymentStatus,
      },
    }
  );

  if (!(result.matchedCount > 0)) {
    return next(new GlobalError('booking not found', statusCode.NOT_FOUND));
  }

  if (!(result.modifiedCount > 0)) {
    return res.status(statusCode.OK).json({
      status: 'fail',
      ok: false,
      message: 'failed to update',
    });
  }

  res.status(statusCode.OK).json({
    status: 'success',
    ok: true,
    content: false,
  });
});

export const getMyAllBookings = asyncHandler(async (req, res, next) => {
  const { _id: userId } = req.user;

  const bookings = await Booking.find(
    {
      'user._id': userId,
    },
    {
      projection: {
        user: 0,
      },
    }
  )
    .sort({ createdAt: 1 })
    .toArray();

  bookings.forEach(booking => {
    const slotTime = new Date(booking.slotTime);

    slotTime.setMinutes(
      slotTime.getMinutes() - Number(CANCEL_BOOKING_BEFORE_TIME)
    );

    if (slotTime.bookingStatus === BOOKING_STATUS.COMPLETED) {
      booking.cancelable = false;
    }

    if (new Date().getTime() > slotTime.getTime()) {
      booking.cancelable = false;
    } else {
      booking.cancelable = true;
    }
  });

  res.status(statusCode.OK).json({
    status: 'success',
    ok: true,
    content: true,
    data: bookings,
  });
});

export const getMyBooking = asyncHandler(async (req, res, next) => {
  const { _id: userId } = req.user;
  const { bookingId } = req.params;

  const result = await Booking.findOne({
    _id: new ObjectId(bookingId),
    'user._id': userId,
  });

  if (!result) {
    return next(new GlobalError('booking not found', statusCode.NOT_FOUND));
  }

  res.status(statusCode.OK).json({
    status: 'success',
    ok: true,
    content: true,
    data: result,
  });
});

export const deleteMyBooking = asyncHandler(async (req, res, next) => {
  const { _id: userId } = req.user;
  const { bookingId } = req.params;

  const booking = await Booking.findOne({
    _id: new ObjectId(bookingId),
    'user._id': new ObjectId(userId),
    bookingStatus: BOOKING_STATUS.PENDING,
  });

  if (!booking) {
    return next(new GlobalError('booking not found', statusCode.NOT_FOUND));
  }

  const slotTime = new Date(booking.slotTime);

  slotTime.setMinutes(
    slotTime.getMinutes() - Number(CANCEL_BOOKING_BEFORE_TIME)
  );

  const currentTime = new Date();

  if (currentTime.getTime() > slotTime.getTime()) {
    return next(
      new GlobalError('cannot cancel this booking', statusCode.BAD_REQUEST)
    );
  }

  const result = await Booking.updateOne(
    {
      _id: new ObjectId(bookingId),
      'user._id': new ObjectId(userId),
    },

    { $set: { bookingStatus: BOOKING_STATUS.CANCELED } }
  );

  if (!(result.matchedCount > 0)) {
    return next(new GlobalError('booking not found', statusCode.NOT_FOUND));
  }

  if (!(result.modifiedCount > 0)) {
    return res.status(statusCode.OK).json({
      status: 'fail',
      ok: false,
      message: 'failed to update',
    });
  }

  res.status(statusCode.OK).json({
    status: 'success',
    ok: true,
    content: false,
  });
});

export const createMembershipBooking = asyncHandler(async (req, res, next) => {
  const { _id: userId } = req.user;
  const { membershipId, serviceId: userSelectedServiceId } = req.params;
  const { addressId, slotId } = req.body;

  if (!addressId || !slotId) {
    return next(
      new GlobalError(
        'Please provide all the required fields',
        statusCode.BAD_REQUEST
      )
    );
  }

  const membership = await Membership.findOne({
    _id: new ObjectId(membershipId),
    'user._id': userId,
    'servicesIncluded.serviceId': userSelectedServiceId,
    expired: false,
  });

  if (!membership) {
    return next(new GlobalError('membership not found', statusCode.NOT_FOUND));
  }

  const service = membership.servicesIncluded.find(service => {
    return service.serviceId === userSelectedServiceId;
  });

  if (!service) {
    return next(new GlobalError('Service not found', statusCode.NOT_FOUND));
  }

  const { serviceId, serviceName, serviceImageUrl } = service;

  if (!service.active || service.remainingServices === 0) {
    return next(new GlobalError('Service is not active', statusCode.NOT_FOUND));
  }

  const slot = await Slot.findOne({ _id: new ObjectId(slotId) });

  if (!slot) {
    return next(
      new GlobalError('Please provide a valid slot id', statusCode.BAD_REQUEST)
    );
  }

  if (slot.slotTime <= new Date()) {
    return next(
      new GlobalError('Slot is not available', statusCode.BAD_REQUEST)
    );
  }

  const address = req.user.addresses.find(add => {
    return add.id.toString() === addressId;
  });

  if (!address) {
    return next(new GlobalError('address not found', statusCode.BAD_REQUEST));
  }

  const filterMembership = {
    _id: new ObjectId(membershipId),
    'servicesIncluded.serviceId': serviceId,
  };

  const updateObject = {
    'servicesIncluded.$.remainingServices': service.remainingServices - 1,
  };

  if (service.remainingServices - 1 === 0) {
    updateObject['servicesIncluded.$.active'] = false;
  }

  await Membership.updateOne(filterMembership, {
    $set: updateObject,
  });

  const order = {
    booking: 'membership',
    payment: PAYMENT_TYPE.MEMBERSHIP,
    paymentStatus: PAYMENT_STATUS.PAID,
    address,
    user: {
      _id: req.user._id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      mobile: req.user.mobile,
    },
    service: { serviceName, serviceImageUrl },
    slotTime: slot.slotTime,
    bookingStatus: BOOKING_STATUS.PENDING,
    createdAt: Date.now(),
  };

  const { insertedId } = await Booking.insertOne(order);

  const slotUpdateObject = {
    $push: {
      bookings: {
        bookingId: insertedId,
      },
    },
  };

  if (slot.bookings.length + 1 >= MAXIMUM_BOOKING_PER_SLOT) {
    slotUpdateObject.$set = { available: false };
  }

  await Slot.updateOne({ _id: new ObjectId(slotId) }, slotUpdateObject);

  res.status(statusCode.CREATED).json({
    status: 'success',
    ok: true,
    content: false,
  });
});
