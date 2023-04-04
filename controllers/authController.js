import User from '../models/User.js';
import statusCode from '../utils/statusCode.js';
import GlobalError from './../error/GlobalError.js';
import asyncHandler from './../utils/asyncHandler.js';
import jwt from 'jsonwebtoken';
import errmsg from '../error/errorMessages.js';
import { verifyMobileNumberUsingOTP, verifyOTP } from './verificationController.js';

// api/v1.0/login
export const loginController = asyncHandler(async function (req, res, next) {
  const { mobileNumber } = req.body;

  if (!mobileNumber || mobileNumber.length !== 10 || !mobileNumber.match(/^[0-9]*$/)) {
    return next(new GlobalError(errmsg.INVALID_MOBILE_NUMBER, statusCode.BAD_REQUEST));
  }

  const { hashedString, otpExpiresTimestamp } = await verifyMobileNumberUsingOTP(mobileNumber);

  res.status(statusCode.OK).json({
    status: 'success',
    data: { hashedString, mobileNumber, otpExpiresTimestamp },
  });
});

// api/v.1.0/verify-otp
export const verifyOTPController = asyncHandler(async function (req, res, next) {
  const { mobileNumber, hashedString, otp, otpExpiresTimestamp } = req.body;

  await validDataForOTPVerification(mobileNumber, hashedString, otp, otpExpiresTimestamp);

  let id = await User.getOne({ mobileNumber });

  if (!id) id = await User.createOne(mobileNumber);

  const token = jwt.sign({ id }, process.env.jwtSecret, {
    expiresIn: process.env.jwtExpiresTime,
  });

  return res.status(statusCode.OK).json({
    status: 'success',
    data: {
      token,
    },
  });
});

// api/v1.0/auth/member/login
export const memberLoginController = asyncHandler(async function (req, res, next) {
  const { mobileNumber, password } = req.body;
  if (!mobileNumber) {
    return next(new GlobalError(errmsg.NO_MOBILE_NUMBER, statusCode.BAD_REQUEST));
  }

  if (!password) {
    return next(new GlobalError(errmsg.NO_PASSWORD, statusCode.BAD_REQUEST));
  }

  const member = await User.getOne({
    mobileNumber: mobileNumber,
    userType: "member"
  });

  if (!member) {
    return next(new GlobalError(errmsg.NO_MEMBER_FOUND, statusCode.NOT_FOUND));
  }

  const isPasswordCorrect = password === member.password;

  if (!isPasswordCorrect) {
    return next(new GlobalError(errmsg.WRONG_PASSWORD, statusCode.BAD_REQUEST));
  }

  const { hashedString, otpExpiresTimestamp } = await verifyMobileNumberUsingOTP(mobileNumber);

  res.status(statusCode.OK).json({
    status: "success",
    data: {
      mobileNumber,
      otpExpiresTimestamp,
      hashedString,
    }
  })
});

const validDataForOTPVerification = async (mobileNumber, hashedString, otp, otpExpiresTimestamp) => {
  if (!mobileNumber) {
    throw new GlobalError(
      errmsg.NO_MOBILE_NUMBER_PROVIDED,
      statusCode.UNAUTHORIZED
    )
  }

  if (!hashedString || !otp || !otpExpiresTimestamp) {
    throw new GlobalError(
      errmsg.REQUIRED_FIELDS_MISSING,
      statusCode.BAD_REQUEST
    );
  }
  await verifyOTP(mobileNumber, otp, otpExpiresTimestamp, hashedString);
}

export const protectRoute = asyncHandler(async function (req, res, next) {
  const { token } = req.headers;

  if (!token) {
    return next(new GlobalError(errmsg.TOKEN_NOT_DEFINED, statusCode.UNAUTHORIZED));
  }

  if (!token.startsWith('Token')) {
    return next(new GlobalError(errmsg.TOKEN_NOT_DEFINED, statusCode.UNAUTHORIZED));
  }

  const tokenString = token.split(' ')[1];
  const decodedTokenString = jwt.verify(tokenString, process.env.jwtSecret);

  if (!decodedTokenString) {
    return next(new GlobalError(errmsg.INVALID_TOKEN, statusCode.UNAUTHORIZED));
  }

  const { id } = decodedTokenString;
  const user = await User.findById(id);

  if (!user) {
    return next(new GlobalError(errmsg.USER_NOT_FOUND, statusCode.UNAUTHORIZED));
  }

  req['id'] = user._id.toString();
  req['user-type'] = user.userType;

  next();
});

export const giveAccessPermission = (...userType) => {
  return asyncHandler((req, res, next) => {
    userType.forEach(user => {
      if (user === req['user-type']) {
        return next();
      }
      return next(new GlobalError(errmsg.UNAUTHORIZED_ACCESS, statusCode.FORBIDDEN));
    });
  });
};