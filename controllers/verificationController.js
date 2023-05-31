import GlobalError from '../error/GlobalError.js';
import { generate, compare } from '../utils/hash.js';
import statusCode from '../utils/statusCode.js';
import crypto from 'node:crypto';
import errmsg from '../error/errorMessages.js';
import https from 'node:https';
import axios from 'axios';

const httpQuestion =
  'https://www.fast2sms.com/dev/bulkV2?authorization=dZbyrEpKz73o2XD96I5GiwPnYuCSmsNV1hTLjcRBvM8agfWFJQMFNcHY0xTyoKa87Gw6sSjp9vfzh5t2&route=otp&variables_values=6969&flash=0&numbers=8851138132';

const minimumLimit = 1234;
const maximumLimit = 9999;

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

// const client = twilio(accountSid, authToken, {
//   lazyLoading: true,
// });

export const verifyMobileUsingOtp = async mobile => {
  // create a hash using the data, random otp, expires time
  const otp = await generateRandomOTP();

  await sendOtpThoughSMS(mobile, otp);

  const otpExpiresAtInMS = Date.now() + Number(process.env.otpValidTime);

  const otpExpiresAt = new Date(otpExpiresAtInMS);

  const data = { mobile, otp, otpExpiresAt };
  const hash = await generate(data);

  return { hash, otpExpiresAt };
};

const generateRandomOTP = async () => {
  return crypto.randomInt(minimumLimit, maximumLimit);
};

const sendOtpThoughSMS = async (mobileNumber, verificationCode) => {
  console.log(
    `${verificationCode} is your verification code for login to car cleanzo. it will be valid for 3 minutes.`
  );

  let url = process.env.FAST2SMS_ROUTE_URL;

  url = url.replace('$MOBILE_NUMBER', mobileNumber);
  url = url.replace('$AUTHORIZATION_KEY', process.env.AUTHORIZATION_KEY);
  url = url.replace('$OTP', verificationCode);

  https.get(url);
};
