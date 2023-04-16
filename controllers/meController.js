import GlobalError from '../error/GlobalError.js';
import User, { USER_TYPE } from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import statusCode from '../utils/statusCode.js';
import filterObject from '../utils/filterObject.js';
import { verifyMobileNumberUsingOTP } from './verificationController.js';

export const getMeController = asyncHandler(async (req, res, next) => {
  const id = req.id;
  const user = await User.getOneById(id);

  res.status(statusCode.OK).json({
    status: 'ok',
    data: {
      me: user,
    },
  });
});

export const updateMeController = asyncHandler(async (req, res, next) => {
  const fieldsObjForUpdate = req.body;

  const fieldsToUpdate = filterObject(fieldsObjForUpdate, [
    'name',
    'vehicle',
    'address',
    'email',
  ]);

  const currentUserId = req['id'];

  const result = await User.updateOneById(currentUserId, fieldsToUpdate);

  res.status(statusCode.OK).json({
    status: 'ok',
  });
});

export const deleteMeController = asyncHandler(async (req, res, next) => {
  const id = req.id;

  const result = await User.updateOneById(id, { isActive: false });

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

  const currentUser = await User.getOneById(req.id);

  if (!currentUser) {
    return next(
      new GlobalError(
        'User not found with this mobile number, try again',
        statusCode.BAD_REQUEST
      )
    );
  }

  const isMobileNumberExits = await User.getOne({
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
