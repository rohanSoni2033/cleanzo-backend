import statusCode from '../utils/statusCode.js';
import GlobalError from './../error/GlobalError.js';
import asyncHandler from './../utils/asyncHandler.js';
import jwt from 'jsonwebtoken';
import errmsg from '../error/errorMessages.js';

import { verifyMobileUsingOtp } from './verificationController.js';
import { compare } from './../utils/hash.js';

import { ObjectId } from 'mongodb';

import { User, FAQs, Location } from './../db/collections.js';
import { USER_TYPE } from '../utils/constants.js';

export const login = asyncHandler(async function (req, res, next) {
  // Get the mobile number from the request body
  const { mobile } = req.body;

  // Check whether the mobile is undefined or not, if so then throw an error back to the user in response

  if (!mobile) {
    return next(
      new GlobalError('Please enter the mobile number', statusCode.BAD_REQUEST)
    );
  }

  // Validate the mobile number
  if (mobile.length !== 10 || !mobile.match(/^[0-9]*$/)) {
    return next(
      new GlobalError(errmsg.INVALID_MOBILE_NUMBER, statusCode.BAD_REQUEST)
    );
  }

  const { hash, otpExpiresAt } = await verifyMobileUsingOtp(mobile);

  res.status(statusCode.OK).json({
    status: 'success',
    ok: true,
    content: true,
    data: {
      hash,
      mobile,
      otpExpiresAt,
    },
  });
});

export const verifyOTP = asyncHandler(async function (req, res, next) {
  const { mobile, otp, otpExpiresAt, hash, deviceToken } = req.body;

  if (!mobile) {
    return next(
      new GlobalError(errmsg.NO_MOBILE_NUMBER_PROVIDED, statusCode.UNAUTHORIZED)
    );
  }

  if (!otp || !otpExpiresAt || !hash || !deviceToken) {
    return next(
      new GlobalError(errmsg.REQUIRED_FIELDS_MISSING, statusCode.BAD_REQUEST)
    );
  }

  const otpIsCorrect = await compare(
    { mobile, otp: Number(otp), otpExpiresAt: new Date(otpExpiresAt) },
    hash
  );

  if (new Date() > new Date(otpExpiresAt)) {
    return next(new GlobalError(errmsg.OTP_EXPIRES, statusCode.BAD_REQUEST));
  }

  if (!otpIsCorrect) {
    return next(new GlobalError(errmsg.WRONG_OTP, statusCode.BAD_REQUEST));
  }

  const user = await User.findOne({ mobile });

  let userId;

  if (user) {
    userId = user._id;
  } else {
    const { insertedId } = await User.insertOne({
      mobile,
      userType: USER_TYPE.USER,
      createdAt: new Date(),
      vehicles: [],
      addresses: [],
      deviceToken,
    });

    userId = insertedId;
  }

  const token = jwt.sign({ userId }, process.env.jwtSecret, {
    expiresIn: process.env.jwtExpiresTime,
  });

  return res.status(statusCode.OK).json({
    status: 'success',
    ok: true,
    content: true,
    data: {
      token,
      user,
    },
  });
});

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

  req.user = user;

  next();
});

export const accessPermission = (...userType) => {
  return asyncHandler(async (req, res, next) => {
    if (userType.includes(req.user.userType)) {
      return next();
    }
    return next(
      new GlobalError(errmsg.UNAUTHORIZED_ACCESS, statusCode.FORBIDDEN)
    );
  });
};

export const memberLogin = asyncHandler(async (req, res, next) => {
  const { mobile, password } = req.body;

  if (!mobile) {
    return next(
      new GlobalError(errmsg.NO_MOBILE_NUMBER, statusCode.BAD_REQUEST)
    );
  }

  if (!password) {
    return next(new GlobalError(errmsg.NO_PASSWORD, statusCode.BAD_REQUEST));
  }

  const user = await User.findOne({
    mobile,
    $or: [{ userType: 'team-member' }, { userType: 'admin' }],
  });

  if (!user) {
    return next(new GlobalError(errmsg.NO_MEMBER_FOUND, statusCode.NOT_FOUND));
  }

  const isPasswordCorrect = password === user.password;

  if (!isPasswordCorrect) {
    return next(new GlobalError(errmsg.WRONG_PASSWORD, statusCode.BAD_REQUEST));
  }

  const { hash, otpExpiresAt } = await verifyMobileUsingOtp(mobileNumber);

  res.status(statusCode.OK).json({
    status: 'success',
    ok: true,
    data: {
      mobile,
      otpExpiresAt,
      hash,
    },
  });
});

export const getFAQs = asyncHandler(async (req, res, next) => {
  const faqs = await FAQs.find().toArray();

  res.status(statusCode.OK).json({
    status: 'success',
    ok: true,
    content: true,
    data: faqs,
  });
});

export const getAvailableLocations = asyncHandler(async (req, res, next) => {
  const locations = await Location.find().toArray();

  res.status(statusCode.OK).json({
    status: 'success',
    ok: true,
    content: true,
    data: locations,
  });
});
