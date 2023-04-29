import GlobalError from '../error/GlobalError.js';
import asyncHandler from '../utils/asyncHandler.js';
import statusCode from '../utils/statusCode.js';
import filterObject from '../utils/filterObject.js';

import { User } from '../db/collections.js';
import { USER_TYPE } from '../utils/constants.js';
import { ObjectId } from 'mongodb';

export const createUser = asyncHandler(async (req, res, next) => {
  const userFields = req.body;

  const filteredUserFields = filterObject(userFields, [
    'mobileNumber',
    'name',
    'password',
    'userType',
  ]);

  const { mobileNumber, userType } = filteredUserFields;

  if (!mobileNumber) {
    return next(
      new GlobalError('Please provide mobile number', statusCode.BAD_REQUEST)
    );
  }

  if (!userType) {
    return next(
      new GlobalError('Please define the user type', statusCode.BAD_REQUEST)
    );
  }

  if (userType === USER_TYPE.USER) {
    return await User.insertOne({
      mobileNumber,
      userType,
      vehicles: [],
      createdAt: new Date(),
    });
  }

  if (
    userType === USER_TYPE.MEMBER &&
    (!filteredUserFields.password || !filteredUserFields.name)
  ) {
    return next(
      new GlobalError('Password and name is required', statusCode.BAD_REQUEST)
    );
  }

  if (userType === USER_TYPE.MEMBER) {
    return await User.insertOne({
      mobileNumber,
      userType: USER_TYPE.MEMBER,
      password: filteredUserFields.password,
      name: filteredUserFields.name,
      createdAt: new Date(),
    });
  }

  res.status(statusCode.CREATED).json({
    status: 'success',
  });
});

export const getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find().toArray();

  res.status(statusCode.OK).json({
    status: 'success',
    data: {
      total: users.length,
      users,
    },
  });
});

export const getUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findOne({ _id: new ObjectId(id) });
  res.status(statusCode.OK).json({
    status: 'success',
    data: {
      user,
    },
  });
});

export const updateUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const data = req.body;
  await User.updateOne({ _id: new ObjectId(id) }, { data });
  res.status(statusCode.OK).json({
    status: 'success',
  });
});

export const deleteUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  await User.updateOne({ _id: new ObjectId(id) }, { active: false });

  res.status(statusCode.OK).json({
    status: 'success',
  });
});

export const createMember = asyncHandler(async (req, res, next) => {
  const memberFields = req.body;

  const filteredMemberFields = filterObject(memberFields, [
    'fullname',
    'mobileNumber',
    'password',
    'userType',
    'address',
    'location',
  ]);

  const { mobileNumber, password } = filteredMemberFields;

  if (!mobileNumber) {
    return next(
      new GlobalError('Mobile number is required', statusCode.BAD_REQUEST)
    );
  }
  if (!password) {
    return next(
      new GlobalError('Password is required', statusCode.BAD_REQUEST)
    );
  }

  const memberAlreadyExits = await User.findOne({ mobileNumber });

  if (memberAlreadyExits) {
    next(
      new GlobalError(
        'Please use another mobile number',
        statusCode.BAD_REQUEST
      )
    );
  }

  await User.insertOne(filteredMemberFields);

  res.status(statusCode.CREATED).json({
    status: 'success',
  });
});
