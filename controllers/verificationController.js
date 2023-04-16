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

const client = twilio(accountSid, authToken, {
  lazyLoading: true,
});

export const verifyMobileNumberUsingOTP = async mobileNumber => {
  // create a hash using the data, random otp, expires time
  const otp = await generateRandomOTP();

  await sendOtpThoughSMS(mobileNumber, otp);

  const otpExpiresTimestamp =
    Date.now() + Number(process.env.otpExpiresTimeInMilliSeconds);

  const data = { mobileNumber, otp, otpExpiresTimestamp };
  const hashedString = await generate(data);

  return { hashedString, otpExpiresTimestamp };
};

export const verifyOTP = async (
  mobileNumber,
  otp,
  otpExpiresTimestamp,
  hashedString
) => {
  otpExpiresTimestamp = Number(otpExpiresTimestamp);
  // first it will if the otp has expired or it is still valid
  const otpIsCorrect = await compare(
    { mobileNumber, otp, otpExpiresTimestamp },
    hashedString
  );

  if (Date.now() > otpExpiresTimestamp) {
    // if otp has expired it will throw an error
    throw new GlobalError(errmsg.OTP_EXPIRES, statusCode.BAD_REQUEST);
  }

  if (!otpIsCorrect) {
    throw new GlobalError(errmsg.WRONG_OTP, statusCode.BAD_REQUEST);
  }
};

const generateRandomOTP = async () => {
  return crypto.randomInt(minimumLimit, maximumLimit);
};

const sendOtpThoughSMS = async (mobileNumber, otp) => {
  console.log(
    `${otp} is your OTP for verification of mobile number with cleanzo. it is valid for 3 minutes.`
  );
  // return await client.messages.create({
  //   from: process.env.TWILIO_MOBILE_NUMBER,
  //   to: `+91${mobileNumber}`,
  //   body: `${otp} is your OTP for verification of mobile number with cleanzo. it is valid for 3 minutes.`,
  // });
};
