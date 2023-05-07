// import Slot from './../models/Slot.js';
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
  const { slotDate, slotTime } = req.body;

  if (!slotDate || !slotTime) {
    next(
      new GlobalError(
        'Please define date and time for the slot',
        statusCode.BAD_REQUEST
      )
    );
  }

  const date = new Date(`${slotDate} ${slotTime}`);

  if (date.toString() === 'Invalid Date') {
    return next(
      new GlobalError(
        'Please provide a valid date(DD/MMM/YYYY) and time(HH:MM AM/PM)',
        statusCode.BAD_REQUEST
      )
    );
  }

  const slotTimestamp = Date.parse(date);

  await Slot.insertOne({
    date,
    timestamp: slotTimestamp,
    available: true,
    bookings: [],
  });

  res.status(statusCode.CREATED).json({
    status: 'success',
    ok: true,
  });
});

export const getAllSlots = asyncHandler(async (req, res, next) => {
  const { available } = req.query;

  const filter = available ? { available: JSON.parse(available) } : {};

  const slots = await Slot.find(filter)
    .filter({ date: { $gt: new Date() } })
    .sort({ slotDate: 1, slotTime: 1 })
    .toArray();

  const groupedSlots = slots.reduce((acc, slot) => {
    const { _id, timestamp, available } = slot;

    const date = new Date(timestamp).toLocaleDateString('default', {
      month: 'short',
      day: '2-digit',
      year: '2-digit',
      weekday: 'short',
    });

    const exitedSlotIndex = acc.findIndex(s => date === s.date);

    if (exitedSlotIndex >= 0) {
      acc[exitedSlotIndex].slots.push({
        _id,
        timestamp,
        available,
      });
      return acc;
    }

    acc.push({
      date,
      slots: [{ _id, timestamp, available }],
    });

    return acc;
  }, []);

  res.status(statusCode.OK).json({
    status: 'success',
    ok: true,
    data: {
      total: slots.length,
      data: groupedSlots,
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
    data: {
      length: bookings.length,
      data: bookings,
    },
  });
});

export const getSlot = getOne(Slot);
export const updateSlot = updateOne(Slot);
export const deleteSlot = deleteOne(Slot);
