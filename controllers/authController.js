import User from '../models/User.js';
import crypto from 'node:crypto';
import statusCode from '../utils/statusCode.js';
import GlobalError from './../error/GlobalError.js';
import asyncHandler from './../utils/asyncHandler.js';
import jwt from 'jsonwebtoken';
import errmsg from '../error/errorMessages.js';
import { verifyMobileNumberUsingOTP, verifyOTP } from './verificationController.js';

export const loginController = asyncHandler(async function (req, res, next) {
  // get the mobile number from the req.body
  const { mobileNumber } = req.body;

  // if mobile number doesn't exit throw the error
  if (!mobileNumber) {
    next(new GlobalError(errmsg.INVALID_MOBILE_NUMBER, statusCode.BAD_REQUEST));
  }

  const { hashedString, otpExpiresTimestamp } = await verifyMobileNumberUsingOTP(mobileNumber);

  res.status(statusCode.OK).json({
    status: 'success',
    data: { hashedString, mobileNumber, otpExpiresTimestamp },
  });
});

const validDataForOTPVerification = async (mobileNumber, hashedString, otp, otpExpiresTimestamp) => {
  // check if the mobile number is provided or not
  if (!mobileNumber) {
    // if phone number doesn't exit send an error message
    throw new GlobalError(
      'Please provide the mobile number to verify otp',
      statusCode.BAD_REQUEST
    )

  }

  // check if all the required field are provided or not
  if (!hashedString || !otp || !otpExpiresTimestamp) {
    // if any of the field is missing though the error message
    throw new GlobalError(
      'Please provide all the required fields',
      statusCode.BAD_REQUEST

    );
  }

  await verifyOTP(mobileNumber, otp, otpExpiresTimestamp, hashedString);
}

export const verifyOTPController = asyncHandler(async function (req, res, next) {
  const { mobileNumber, hashedString, otp, otpExpiresTimestamp } = req.body;


  await validDataForOTPVerification(mobileNumber, hashedString, otp, otpExpiresTimestamp);


  // check if the account with this mobile number or not
  let id = await User.findByMobileNumber(mobileNumber);

  if (!id) id = await User.save(mobileNumber);

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

export const deleteUserAccount = asyncHandler(function (req, res, next) { });

export const authenticate = asyncHandler(async function (req, res, next) {
  const { token } = req.headers;

  if (!token) {
    return next(new GlobalError(errmsg.TOKEN_NOT_DEFINED, statusCode.BAD_REQUEST));
  }

  if (!token.startsWith('Token')) {
    return next(new GlobalError(errmsg.TOKEN_NOT_DEFINED, statusCode.BAD_REQUEST));
  }

  const tokenString = token.split(' ')[1];
  const decodedTokenString = jwt.verify(tokenString, process.env.jwtSecret);

  if (!decodedTokenString) {
    return next(new GlobalError(errmsg.INVALID_TOKEN, statusCode.BAD_REQUEST));
  }

  const { id } = decodedTokenString;
  const user = await User.findById(id);

  if (!user) {
    return next(new GlobalError(errmsg.USER_NOT_FOUND, statusCode.BAD_REQUEST));
  }

  req['id'] = user._id.toString();
  req['user-type'] = user.userType;

  next();
});

export const authorized = (...allowedUserType) => {
  return asyncHandler((req, res, next) => {
    allowedUserType.forEach(user => {
      if (user === req['user-type']) {
        return next();
      }

      return next(new GlobalError(errmsg.UNAUTHORIZED_ACCESS, statusCode.BAD_REQUEST));
    });
  });
};

export const memberLoginController = asyncHandler(async function (req, res, next) {
  const { mobileNumber, password } = req.body;
  if (!mobileNumber) {
    return next(new GlobalError("Please enter your mobile number", statusCode.BAD_REQUEST));
  }

  if (!password) {
    return next(new GlobalError("Please enter your password", statusCode.BAD_REQUEST));
  }

  const member = User.findOneWithFilter({ mobileNumber, password, userType: "member" });

  if (!member) {
    return next(new GlobalError("User not found, please try again", statusCode.BAD_REQUEST));
  }

  const isPasswordCorrect = password === member.password;

  if (!isPasswordCorrect) {
    return next(new GlobalError("Wrong password, please try again", statusCode.BAD_REQUEST));
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


export const memberVerificationController = asyncHandler(async function (req, res, next) {
  const { mobileNumber, hashedString, otp, otpExpiresTimestamp } = req.body;

  await validDataForOTPVerification(mobileNumber, hashedString, otp, otpExpiresTimestamp);
  // check if the account with this mobile number or not
  const id = User.findOneWithFilter({ mobileNumber, userType: "member" });

  if (!id) {
    return next(new GlobalError("User not found, try again", statusCode.BAD_REQUEST));
  }

  const token = jwt.sign({ id }, jwtSecret, {
    expiresIn: '90h',
  });

  return res.status(statusCode.OK).json({
    status: 'success',
    data: {
      token,
    },
  });
});