import Slot from './../models/Slot.js';
import {
  getAll,
  getOne,
  updateOne,
  deleteOne,
} from './../controllers/factoryController.js';
import asyncHandler from '../utils/asyncHandler.js';
import statusCode from '../utils/statusCode.js';
import GlobalError from '../error/GlobalError.js';

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

  await Slot.createOne({
    slotDate,
    slotTime,
    isAvailable: true,
    totalBookings: 0,
  });

  res.status(statusCode.CREATED).json({
    status: 'success',
  });
});

export const getAllSlots = getAll(Slot);
export const getSlot = getOne(Slot);
export const updateSlot = updateOne(Slot);
export const deleteSlot = deleteOne(Slot);
