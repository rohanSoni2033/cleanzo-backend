import GlobalError from '../error/GlobalError.js';
import asyncHandler from '../utils/asyncHandler.js';
import statusCode from '../utils/statusCode.js';
import { ObjectId } from 'mongodb';

import { User } from '../db/collections.js';

export const getMeController = asyncHandler(async (req, res, next) => {
  const { _id: userId } = req.user;

  const user = await User.findOne(
    { _id: new ObjectId(userId) },
    { projection: { createdAt: 0, userType: 0 } }
  );

  res.status(statusCode.OK).json({
    status: 'success',
    ok: true,
    data: user,
  });
});

export const updateUserName = asyncHandler(async (req, res, next) => {
  const { firstName, lastName } = req.body;

  if (!firstName || !lastName) {
    return next(
      new GlobalError(
        'Please provide first name and the last name',
        statusCode.BAD_REQUEST
      )
    );
  }

  const { _id: userId } = req.user;

  await User.updateOne(
    { _id: new ObjectId(userId) },
    { $set: { firstName, lastName } }
  );

  res.status(statusCode.OK).json({
    status: 'success',
    ok: true,
  });
});

export const addUserAddress = asyncHandler(async (req, res, next) => {
  const { name, mobile, city, area, locality, address, addressType } = req.body;

  if (
    !name ||
    !mobile ||
    !city ||
    !area ||
    !locality ||
    !address ||
    !addressType
  ) {
    return next(
      new GlobalError(
        'Please provide all the required fields',
        statusCode.BAD_REQUEST
      )
    );
  }

  const { _id: userId } = req.user;

  const addressId = new ObjectId();

  await User.updateOne(
    { _id: new ObjectId(userId) },
    {
      $push: {
        addresses: {
          id: addressId,
          name,
          mobile,
          city,
          area,
          locality,
          address,
          addressType,
        },
      },
    }
  );

  res.status(statusCode.OK).json({
    status: 'success',
    ok: true,
    content: true,
    data: {
      addressId,
    },
  });
});

export const deleteUserAddress = asyncHandler(async (req, res, next) => {
  const { _id: userId } = req.user;
  const { addressId } = req.params;

  const result = await User.updateOne(
    {
      _id: new ObjectId(userId),
    },
    {
      $pull: { addresses: { id: new ObjectId(addressId) } },
    }
  );

  if (result.matchedCount > 0 && result.modifiedCount > 0) {
    res.status(statusCode.OK).json({
      status: 'success',
      ok: true,
      content: false,
    });
  } else {
    return res.status(statusCode.BAD_REQUEST).json({
      status: 'fail',
      ok: false,
      message: 'address not found',
    });
  }
});

export const deleteMeController = asyncHandler(async (req, res, next) => {
  const { _id: userId } = req.user;

  const result = await User.updateOne(
    { _id: new ObjectId(userId) },
    { active: false }
  );

  res.status(statusCode.OK).json({
    status: 'success',
    ok: true,
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

  const { _id: userId } = req.user;

  const currentUser = await User.findOne(userId);

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
    ok: true,
    content: true,
    data: {
      mobileNumber: newMobileNumber,
      otpExpiresTimestamp,
      hashedString,
    },
  });
});
