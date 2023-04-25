import Slot from './../models/Slot.js';
import asyncHandler from '../utils/asyncHandler.js';
import statusCode from '../utils/statusCode.js';
import GlobalError from '../error/GlobalError.js';
import {
  getOne,
  updateOne,
  deleteOne,
} from './../controllers/factoryController.js';

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

  const days = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];

  const date = new Date(`${slotDate} ${slotTime}`);

  if (date.toString() === 'Invalid Date') {
    return next(
      new GlobalError(
        'Please provide a valid date(DD/MMM/YYYY) and time(HH:MM AM/PM)',
        statusCode.BAD_REQUEST
      )
    );
  }

  await Slot.createOne({
    slotDay: days[date.getDay() - 1],
    slotDate: date.toLocaleDateString(),
    slotTime: date.toLocaleTimeString(),
    available: true,
    bookings: [],
  });

  res.status(statusCode.CREATED).json({
    status: 'success',
  });
});

export const getAllSlots = asyncHandler(async (req, res, next) => {
  const { available } = req.query;
  const filter = available ? { available: JSON.parse(available) } : {};

  const slots = await Slot.getAll({
    filter,
    sortQuery: { slotDate: 1, slotTime: 1 },
  });

  slots.forEach(slot => delete slot.bookings);

  res.status(statusCode.OK).json({
    status: 'success',
    data: {
      total: slots.length,
      slots,
    },
  });
});

export const getSlotBookings = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const slot = await Slot.getOneById(id);
  const { bookings } = slot;

  // fetch all the bookings from the database
  res.status(statusCode.OK).json({
    status: 'success',
    data: {
      length: bookings.length,
      bookings,
    },
  });
});

export const getSlot = getOne(Slot);
export const updateSlot = updateOne(Slot);
export const deleteSlot = deleteOne(Slot);
