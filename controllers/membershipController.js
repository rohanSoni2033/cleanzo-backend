import asyncHandler from '../utils/asyncHandler.js';
import statusCode from '../utils/statusCode.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import cron from 'node-cron';

import {
  Membership,
  MembershipPlan,
  Vehicle,
  Payments,
  Slot,
} from '../db/collections.js';

import { ObjectId } from 'mongodb';
import GlobalError from '../error/GlobalError.js';

const razorpay = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,
});

const deleteExpiresMembership = async () => {
  try {
    await Membership.updateMany(
      { expiresAt: { $lte: new Date() } },
      { $set: { expired: true } }
    );

    await Slot.deleteMany({
      slotTime: { $lt: new Date() },
      bookings: { $size: 0 },
    });
  } catch (err) {
    console.log(err.message);
  }
};

const cronJob = cron.schedule('0 0 * * *', deleteExpiresMembership, {
  scheduled: true,
  timezone: 'Asia/Kolkata',
});

cronJob.start();

export const getMembershipOrderId = asyncHandler(async (req, res, next) => {
  const { membershipPlanId, vehicleId, durationInMonths } = req.query;

  const { _id: userId } = req.user;

  if (!membershipPlanId || !durationInMonths || !vehicleId) {
    return next(
      new GlobalError(
        'Please provide all the required fields',
        statusCode.BAD_REQUEST
      )
    );
  }

  const vehicle = await Vehicle.findOne({ _id: new ObjectId(vehicleId) });

  if (!vehicle) {
    return next(new GlobalError('vehicle not found', statusCode.BAD_REQUEST));
  }

  const membershipPlan = await MembershipPlan.findOne({
    _id: new ObjectId(membershipPlanId),
  });

  if (!membershipPlan) {
    return next(
      new GlobalError('membership plan is not found', statusCode.NOT_FOUND)
    );
  }

  const membershipPlanDuration = membershipPlan.durations.find(duration => {
    return duration.duration === Number(durationInMonths);
  });

  if (!membershipPlanDuration) {
    return next(
      new GlobalError(
        'Membership plan duration not found',
        statusCode.NOT_FOUND
      )
    );
  }

  const { duration, planBasePrice } = membershipPlanDuration;

  const totalPlanPrice =
    planBasePrice + vehicle.additionalServicePrice * duration;

  const order = await razorpay.orders.create({
    amount: totalPlanPrice * 100,
    currency: 'INR',
    receipt: crypto.randomUUID(),
    notes: {
      membershipPlanId,
      durationInMonths,
      vehicleId,
      userId: userId.toString(),
    },
  });

  if (order.status !== 'created') {
    return next(
      new GlobalError('failed to generate the order id', statusCode.BAD_REQUEST)
    );
  }

  res.status(statusCode.OK).json({
    status: 'success',
    ok: true,
    data: {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    },
  });
});

export const createMembership = asyncHandler(async (req, res, next) => {
  const user = req.user;

  const { paymentId } = req.body;

  if (!paymentId) {
    return next(
      new GlobalError('please provide the payment id', statusCode.BAD_REQUEST)
    );
  }

  const paymentDetails = await Payments.findOne({
    paymentId: paymentId,
  });

  if (paymentDetails) {
    return next(
      new GlobalError('paymentId is already used', statusCode.PAYMENT_REQUIRED)
    );
  }

  const payment = await razorpay.payments.fetch(paymentId);

  const orderDetails = await razorpay.orders.fetch(payment.order_id);

  const { membershipPlanId, vehicleId, durationInMonths, userId } =
    orderDetails.notes;

  if (user._id.toString() != userId.toString()) {
    return next(
      new GlobalError(
        'User who initiated the payment and the user who is booking the membership is different',
        statusCode.BAD_REQUEST
      )
    );
  }

  const membershipPlan = await MembershipPlan.findOne({
    _id: new ObjectId(membershipPlanId),
  });

  const membershipPlanDuration = membershipPlan.durations.find(duration => {
    return duration.duration === Number(durationInMonths);
  });

  if (!membershipPlanDuration) {
    return next(
      new GlobalError(
        'Membership plan duration not found',
        statusCode.NOT_FOUND
      )
    );
  }

  const servicesIncluded = membershipPlanDuration.servicesIncluded;

  servicesIncluded.forEach(service => {
    service.remainingServices = service.totalServices;
    service.active = true;
  });

  // get the current date using Date constructor
  const currentDate = new Date();
  // get the number of current month
  const currentMonth = currentDate.getMonth();

  currentDate.setMonth(currentMonth + Number(durationInMonths));

  const { insertedId: generatedPaymentId } = await Payments.insertOne({
    paymentId,
    createdAt: new Date(),
    userId: user._id,
  });

  const { insertedId } = await Membership.insertOne({
    user: {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      mobile: user.mobile,
    },
    membershipPlanId,
    vehicleId,
    paymentId: generatedPaymentId,
    servicesIncluded,
    expired: false,
    expiresAt: currentDate,
    createdAt: new Date(),
  });

  if (!insertedId) {
    return next(
      new GlobalError(
        'failed to purchase the membership plan',
        statusCode.BAD_REQUEST
      )
    );
  }

  res.status(statusCode.OK).json({
    status: 'success',
    ok: true,
  });
});

export const getAllMemberships = asyncHandler(async (req, res, next) => {
  const memberships = await Membership.find().toArray();

  res.status(statusCode.OK).json({
    status: 'success',
    data: {
      length: memberships.length,
      memberships,
    },
  });
});

export const getMembershipBooking = asyncHandler(async (req, res, next) => {
  const { membershipId } = req.params;

  const membership = await Membership.findOne({
    _id: new ObjectId(membershipId),
  });

  res.status(statusCode.OK).json({
    status: 'success',
    data: membership,
  });
});

export const getMyMemberships = asyncHandler(async (req, res, next) => {
  const { _id: userId } = req.user;

  const memberships = await Membership.find({
    'user._id': userId,
  }).toArray();

  res.status(statusCode.OK).json({
    status: 'success',
    ok: true,
    data: {
      length: memberships.length,
      data: memberships,
    },
  });
});
