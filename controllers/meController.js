import GlobalError from '../error/GlobalError.js';
import asyncHandler from '../utils/asyncHandler.js';
import statusCode from '../utils/statusCode.js';
import filterObject from '../utils/filterObject.js';
import { verifyMobileNumberUsingOTP } from './verificationController.js';
import { ObjectId } from 'mongodb';

import { User } from '../db/collections.js';

export const getMeController = asyncHandler(async (req, res, next) => {
  const userId = req.userId;

  const user = await User.findOne({ _id: new ObjectId(userId) });

  res.status(statusCode.OK).json({
    status: 'success',
    data: user,
  });
});

export const updateMeController = asyncHandler(async (req, res, next) => {
  const fieldsObjForUpdate = req.body;

  const fieldsToUpdate = filterObject(fieldsObjForUpdate, [
    'name',
    'address',
    'email',
  ]);

  if (fieldsObjForUpdate.vehicle) {
    if (!Array.isArray(fieldsObjForUpdate.vehicle)) {
      return next(
        new GlobalError(
          'Vehicle must be type of an array',
          statusCode.BAD_REQUEST
        )
      );
    }
  }

  const userId = req.userId;

  const result = await User.updateOne(
    { _id: new ObjectId(userId) },
    fieldsToUpdate
  );

  res.status(statusCode.OK).json({
    status: 'success',
  });
});

export const deleteMeController = asyncHandler(async (req, res, next) => {
  const userId = req.userId;

  const result = await User.updateOne(
    { _id: new ObjectId(userId) },
    { active: false }
  );

  res.status(statusCode.OK).json({
    status: 'success',
  });
});

export const updateMobileNumber = asyncHandler(async (req, res, next) => {
  const { newMobileNumber } = req.body;

  if (!newMobileNumber) {
    return next(
      new GlobalError(
        'Please provide a new mobile number to update',
        statusCode.BAD_REQUEST
      )
    );
  }

  const currentUser = await User.findOne(req.userId);

  if (!currentUser) {
    return next(
      new GlobalError(
        'User not found with this mobile number, try again',
        statusCode.BAD_REQUEST
      )
    );
  }

  const isMobileNumberExits = await User.findOne({
    mobileNumber: newMobileNumber,
  });

  if (isMobileNumberExits) {
    return next(
      new GlobalError(
        'mobile number is already in use, please try another',
        statusCode.BAD_REQUEST
      )
    );
  }

  const { hashedString, otpExpiresTimestamp } =
    await verifyMobileNumberUsingOTP(newMobileNumber);

  res.status(statusCode.OK).json({
    status: 'success',
    data: {
      mobileNumber: newMobileNumber,
      otpExpiresTimestamp,
      hashedString,
    },
  });
});
