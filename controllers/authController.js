import statusCode from '../utils/statusCode.js';
import GlobalError from './../error/GlobalError.js';
import asyncHandler from './../utils/asyncHandler.js';
import jwt from 'jsonwebtoken';
import errmsg from '../error/errorMessages.js';

import {
  verifyMobileNumberUsingOTP,
  verifyOTP,
} from './verificationController.js';

import { ObjectId } from 'mongodb';

import { User } from './../db/collections.js';
import { USER_TYPE } from '../utils/constants.js';

export const loginController = asyncHandler(async function (req, res, next) {
  const { mobileNumber } = req.body;

  if (
    !mobileNumber ||
    mobileNumber.length !== 10 ||
    !mobileNumber.match(/^[0-9]*$/)
  ) {
    return next(
      new GlobalError(errmsg.INVALID_MOBILE_NUMBER, statusCode.BAD_REQUEST)
    );
  }

  const { hashedString, otpExpiresTimestamp } =
    await verifyMobileNumberUsingOTP(mobileNumber);

  res.status(statusCode.OK).json({
    status: 'success',
    ok: true,
    data: { hashedString, mobileNumber, otpExpiresTimestamp },
  });
});

export const verifyOTPController = asyncHandler(async function (
  req,
  res,
  next
) {
  const { mobileNumber, hashedString, otp, otpExpiresTimestamp } = req.body;

  await validDataForOTPVerification(
    mobileNumber,
    hashedString,
    otp,
    otpExpiresTimestamp
  );

  if (req.userId && req.headers.authorization) {
    await User.updateOneById(req.userId, { mobileNumber });
    return res.status(statusCode.OK).json({
      status: 'success',
      ok: true,
    });
  }

  const user = await User.findOne({ mobileNumber });

  let userId;

  if (user) {
    userId = user._id;
  } else {
    const { insertedId } = await User.insertOne({
      mobileNumber,
      userType: USER_TYPE.USER,
      createdAt: Date.now(),
      vehicles: [],
    });

    userId = insertedId;
  }

  const token = jwt.sign({ userId }, process.env.jwtSecret, {
    expiresIn: process.env.jwtExpiresTime,
  });

  return res.status(statusCode.OK).json({
    status: 'success',
    ok: true,
    data: {
      token,
    },
  });
});

export const memberLoginController = asyncHandler(async (req, res, next) => {
  const { mobileNumber, password } = req.body;
  if (!mobileNumber) {
    return next(
      new GlobalError(errmsg.NO_MOBILE_NUMBER, statusCode.BAD_REQUEST)
    );
  }

  if (!password) {
    return next(new GlobalError(errmsg.NO_PASSWORD, statusCode.BAD_REQUEST));
  }

  const user = await User.findOne({
    mobileNumber,
    $or: [{ userType: 'team' }, { userType: 'admin' }],
  });

  if (!user) {
    return next(new GlobalError(errmsg.NO_MEMBER_FOUND, statusCode.NOT_FOUND));
  }

  const isPasswordCorrect = password === user.password;

  if (!isPasswordCorrect) {
    return next(new GlobalError(errmsg.WRONG_PASSWORD, statusCode.BAD_REQUEST));
  }

  const { hashedString, otpExpiresTimestamp } =
    await verifyMobileNumberUsingOTP(mobileNumber);

  res.status(statusCode.OK).json({
    status: 'success',
    ok: true,
    data: {
      mobileNumber,
      otpExpiresTimestamp,
      hashedString,
    },
  });
});

const validDataForOTPVerification = async (
  mobileNumber,
  hashedString,
  otp,
  otpExpiresTimestamp
) => {
  if (!mobileNumber) {
    throw new GlobalError(
      errmsg.NO_MOBILE_NUMBER_PROVIDED,
      statusCode.UNAUTHORIZED
    );
  }

  if (!hashedString || !otp || !otpExpiresTimestamp) {
    throw new GlobalError(
      errmsg.REQUIRED_FIELDS_MISSING,
      statusCode.BAD_REQUEST
    );
  }
  await verifyOTP(mobileNumber, otp, otpExpiresTimestamp, hashedString);
};

export const protectRoute = asyncHandler(async function (req, res, next) {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer')) {
    return next(
      new GlobalError(errmsg.TOKEN_NOT_DEFINED, statusCode.UNAUTHORIZED)
    );
  }

  const tokenString = authorization.split(' ')[1];
  const decodedTokenString = jwt.verify(tokenString, process.env.jwtSecret);

  if (!decodedTokenString) {
    return next(new GlobalError(errmsg.INVALID_TOKEN, statusCode.UNAUTHORIZED));
  }

  const { userId } = decodedTokenString;

  const user = await User.findOne({ _id: new ObjectId(userId) });

  if (!user) {
    return next(
      new GlobalError(errmsg.USER_NOT_FOUND, statusCode.UNAUTHORIZED)
    );
  }

  req.userId = user._id.toString();
  req.userType = user.userType;

  next();
});

export const accessPermission = (...userType) => {
  return asyncHandler(async (req, res, next) => {
    if (userType.includes(req.userType)) {
      return next();
    }
    return next(
      new GlobalError(errmsg.UNAUTHORIZED_ACCESS, statusCode.FORBIDDEN)
    );
  });
};
