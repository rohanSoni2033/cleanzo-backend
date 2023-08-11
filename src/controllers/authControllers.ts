import statusCode from '../utils/statusCode.js';
import GlobalError from './../error/GlobalError.js';
import asyncHandler from './../utils/asyncHandler.js';
import errmsg from '../error/errorMessages.js';

import { Request, Response, NextFunction } from 'express';
import { generateVerificationCode } from './mobileVerification.js';
import { ResponseStatus, userTypes } from '../utils/constants.js';
import { compare } from '../utils/hash.js';
import { users as userCollection } from './../database/collections.js';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

interface VerifyMobile {
  mobile: string | undefined;
  verificationCode: string | undefined;
  verificationCodeExpiresAt: string | undefined;
  userType: userTypes | undefined;
  hash: string | undefined;
  deviceToken?: string | undefined;
}

const validUserTypes = [userTypes.USER, userTypes.ADMIN, userTypes.MEMBER];

export const login = asyncHandler(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { mobile, password, userType } = req.body as {
    mobile: string | undefined;
    password: string | undefined;
    userType: userTypes | undefined;
  };

  if (!mobile || !mobile.match(/^[0-9]{10}$/)) {
    return next(new GlobalError(errmsg.INVALID_MOBILE, statusCode.BAD_REQUEST));
  }

  if (!userType || !validUserTypes.includes(userType)) {
    return next(
      new GlobalError(errmsg.INVALID_USER_TYPE, statusCode.BAD_REQUEST)
    );
  }

  if (userType === userTypes.ADMIN || userType === userTypes.MEMBER) {
    if (!password) {
      return next(new GlobalError(errmsg.NO_PASSWORD, statusCode.BAD_REQUEST));
    }

    const user = await userCollection?.findOne(
      {
        mobile,
        userType,
      },
      {
        projection: {
          password: 1,
        },
      }
    );

    if (!user) {
      return next(
        new GlobalError(errmsg.NO_USER_WITH_MOBILE, statusCode.NOT_FOUND)
      );
    }

    const passwordMatched: boolean = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatched) {
      return next(
        new GlobalError(errmsg.WRONG_PASSWORD, statusCode.BAD_REQUEST)
      );
    }
  }

  const { hash, verificationCodeExpiresAt, verificationCodeExpiresInMS } =
    await generateVerificationCode(mobile);

  res.status(statusCode.OK).json({
    status: ResponseStatus.SUCCESS,
    data: {
      mobile,
      hash,
      verificationCodeExpiresAt,
      verificationCodeExpiresInMS,
      userType,
    },
  });
});

export const verifyMobile = asyncHandler(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const {
    mobile,
    verificationCode,
    verificationCodeExpiresAt,
    userType,
    hash,
    deviceToken,
  } = req.body as VerifyMobile;

  if (!verificationCode) {
    return next(new GlobalError(errmsg.NO_CODE, statusCode.BAD_REQUEST));
  }

  if (!mobile || !verificationCodeExpiresAt || !hash) {
    return next(
      new GlobalError(errmsg.NO_REQUIRED_FIELDS, statusCode.BAD_REQUEST)
    );
  }

  if (!userType || !validUserTypes.includes(userType)) {
    return next(
      new GlobalError(errmsg.INVALID_USER_TYPE, statusCode.BAD_REQUEST)
    );
  }

  const verificationCodeExpiresAtTime = new Date(verificationCodeExpiresAt);

  const currentTime = new Date();

  if (currentTime >= verificationCodeExpiresAtTime) {
    return next(new GlobalError(errmsg.CODE_EXPIRES, statusCode.BAD_REQUEST));
  }

  const codeIsCorrect = await compare(
    {
      mobile,
      verificationCode,
      verificationCodeExpiresAt: verificationCodeExpiresAtTime,
    },
    hash
  );

  if (!codeIsCorrect) {
    return next(new GlobalError(errmsg.CODE_INCORRECT, statusCode.BAD_REQUEST));
  }

  let user = (await userCollection?.findOne(
    {
      mobile,
      userType,
    },
    {
      projection: {
        _id: 1,
      },
    }
  )) as { _id: ObjectId };

  if (!user) {
    if (userType === userTypes.ADMIN || userType === userTypes.MEMBER) {
      return next(new GlobalError(errmsg.USER_NOT_FOUND, statusCode.NOT_FOUND));
    }

    const result = await userCollection?.insertOne({
      mobile,
      userType: userTypes.USER,
      createdAt: new Date(),
      deviceToken,
    });

    if (!result) {
      return next(
        new GlobalError(errmsg.FAILED_INSERTING_USER, statusCode.BAD_REQUEST)
      );
    }

    user = { _id: result?.insertedId };
  }

  const jwtSecret: string = process.env.JWT_SECRET!;
  const jwtExpiresIn: string = process.env.JWT_EXPIRES_IN!;

  const token = jwt.sign({ userId: user?._id }, jwtSecret, {
    expiresIn: jwtExpiresIn,
  });

  res.status(statusCode.OK).json({
    status: ResponseStatus.SUCCESS,
    data: {
      token,
    },
  });
});

export const authorize = asyncHandler(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer')) {
    return next(
      new GlobalError(errmsg.TOKEN_NOT_DEFINED, statusCode.UNAUTHORIZED)
    );
  }

  const tokenString = authorization.split(' ')[1];

  const decodedTokenString = jwt.verify(tokenString, process.env.JWT_SECRET!);

  if (!decodedTokenString) {
    return next(new GlobalError(errmsg.INVALID_TOKEN, statusCode.UNAUTHORIZED));
  }

  const { userId } = decodedTokenString as { userId: string };

  const user = await userCollection?.findOne({ _id: new ObjectId(userId) });

  if (!user) {
    return next(
      new GlobalError(errmsg.USER_NOT_FOUND, statusCode.UNAUTHORIZED)
    );
  }

  req.user = user;

  next();
});

export const accessPermission = function (...userType: userTypes[]) {
  return asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      if (userType.includes(req.user.userType)) {
        return next();
      }
      return next(
        new GlobalError(errmsg.UNAUTHORIZED_ACCESS, statusCode.FORBIDDEN)
      );
    }
  );
};
