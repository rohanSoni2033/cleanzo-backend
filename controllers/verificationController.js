import GlobalError from '../error/GlobalError.js';
import { generate, compare } from '../utils/hash.js';
import statusCode from '../utils/statusCode.js';
import crypto from 'node:crypto';
import errmsg from '../error/errorMessages.js';
import twilio from 'twilio';

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

  const otpExpiresAt = Date.now() + Number(process.env.otpValidTime);

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
  // return await client.messages.create({
  //   from: process.env.TWILIO_MOBILE_NUMBER,
  //   to: `+91${mobileNumber}`,
  //   body: `${verificationCode} is your verification code for login to car cleanzo. it will be valid for 3 minutes.`
  // });
};
