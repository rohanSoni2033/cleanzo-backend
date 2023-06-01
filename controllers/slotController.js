import asyncHandler from '../utils/asyncHandler.js';
import statusCode from '../utils/statusCode.js';
import GlobalError from '../error/GlobalError.js';
import {
  getOne,
  updateOne,
  deleteOne,
} from './../controllers/factoryController.js';
import { ObjectId } from 'mongodb';

import { Slot } from './../db/collections.js';

export const createSlot = asyncHandler(async (req, res, next) => {
  const { date, time } = req.body;

  if (!date || !time) {
    next(
      new GlobalError(
        'Please define date and time for the slot',
        statusCode.BAD_REQUEST
      )
    );
  }

  const slotTime = new Date(`${date} ${time}`);

  if (slotTime.toString() === 'Invalid Date') {
    return next(
      new GlobalError(
        'Please provide a valid date(DD/MMM/YYYY) and time(HH:MM AM/PM)',
        statusCode.BAD_REQUEST
      )
    );
  }

  const slot = await Slot.findOne({ slotTime });

  if (slot) {
    return next(
      new GlobalError(
        'slot with exact time and date exits',
        statusCode.BAD_REQUEST
      )
    );
  }

  await Slot.insertOne({
    slotTime,
    available: true,
    bookings: [],
  });

  res.status(statusCode.CREATED).json({
    status: 'success',
    ok: true,
    content: false,
  });
});

export const getAllSlots = asyncHandler(async (req, res, next) => {
  const { available } = req.query;
  // TODO
  // update all the slots if the time is over make it not available
  // filter using date not time

  const filter = available ? { available: JSON.parse(available) } : {};

  const slots = await Slot.find(filter, {
    projection: {
      bookings: 0,
    },
  })
    .filter({ slotTime: { $gt: new Date() } })
    .sort({ slotTime: 1 })
    .toArray();

  const groupedSlots = slots.reduce((acc, slot) => {
    const { _id, slotTime, available } = slot;

    const date = new Date(slotTime);

    const slotDate = new Date(
      date.toLocaleDateString('en-US', { dateStyle: 'full' })
    );

    const exitedSlotIndex = acc.findIndex(s => {
      return s.slotDate.getTime() == slotDate.getTime();
    });

    if (exitedSlotIndex >= 0) {
      acc[exitedSlotIndex].slots.push({
        _id,
        slotTime,
        available,
      });
      return acc;
    }

    acc.push({
      slotDate,
      slots: [{ _id, slotTime, available }],
    });

    return acc;
  }, []);

  res.status(statusCode.OK).json({
    status: 'success',
    ok: true,
    content: true,
    data: {
      groupedSlots,
    },
  });
});

export const getSlotBookings = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const slot = await Slot.findOne({ _id: new ObjectId(id) });
  const { bookings } = slot;

  // fetch all the bookings from the database
  res.status(statusCode.OK).json({
    status: 'success',
    ok: true,
    content: true,
    data: {
      bookings,
    },
  });
});

export const getSlot = getOne(Slot);
export const updateSlot = updateOne(Slot);
export const deleteSlot = deleteOne(Slot);
