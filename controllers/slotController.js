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

  const slotDateInstance = new Date(`${slotDate}`);
  const slotTimeInstance = new Date(`${slotDate} ${slotTime}`);

  if (
    slotDateInstance.toString() === 'Invalid Date' ||
    slotTimeInstance.toString() === 'Invalid Date'
  ) {
    return next(
      new GlobalError(
        'Please provide a valid date(DD/MMM/YYYY) and time(HH:MM AM/PM)',
        statusCode.BAD_REQUEST
      )
    );
  }

  const slot = Slot.findOne({ slotTime: slotTimeInstance.getTime() });
  if (slot) {
    return next(
      new GlobalError(
        'slot with exact time and date exits',
        statusCode.BAD_REQUEST
      )
    );
  }

  await Slot.insertOne({
    slotDate: slotDateInstance.getTime(),
    slotTime: slotTimeInstance.getTime(),
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
    .filter({ slotTime: { $gt: new Date().getTime() } })
    .sort({ slotDate: 1, slotTime: 1 })
    .toArray();

  const groupedSlots = slots.reduce((acc, slot) => {
    const { _id, slotDate, slotTime, available } = slot;

    const exitedSlotIndex = acc.findIndex(s => s.slotDate === slotDate);

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
