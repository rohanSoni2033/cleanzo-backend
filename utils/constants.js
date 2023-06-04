export const USER_TYPE = {
  ADMIN: 'admin',
  MEMBER: 'member',
  USER: 'user',
};

export const BOOKING_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
};

export const PAYMENT_TYPE = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  MEMBERSHIP: 'membership',
};

export const PAYMENT_STATUS = {
  FAILED: 'failed',
  PAID: 'paid',
  OFFLINE_PAYMENT: 'offline payment',
  NOT_PAID: 'not paid',
};

import { ObjectId } from 'mongodb';

import { BusinessRelated } from '../db/collections.js';

const businessRelatedData = await BusinessRelated.findOne({
  _id: new ObjectId(process.env.businessRelatedCollectionId),
});

export const MAXIMUM_BOOKING_PER_SLOT =
  businessRelatedData.maximumBookingPerSlot;

export const CANCEL_BOOKING_BEFORE_TIME =
  businessRelatedData.cancelBookingBeforeTime;
