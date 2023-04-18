import GlobalError from '../error/GlobalError.js';
import User, { USER_TYPE } from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import statusCode from '../utils/statusCode.js';
import filterObject from '../utils/filterObject.js';

class Location {
  constructor(lat, long) {
    this.lat = lat;
    this.long = long;
  }
}

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
    return await User.createOne(mobileNumber);
  }

  if (
    userType === USER_TYPE.MEMBER &&
    (!filteredUserFields.password || !filteredUserFields.name)
  ) {
    return next(
      new GlobalError(
        'password and name is required to create a member account',
        statusCode.BAD_REQUEST
      )
    );
  }

  if (userType === USER_TYPE.MEMBER) {
    return await User.createOne(
      mobileNumber,
      USER_TYPE.MEMBER,
      filteredUserFields.password,
      filteredUserFields.name
    );
  }

  res.status(statusCode.CREATED).json({
    status: 'success',
  });
});

export const getAllUsers = asyncHandler(async (req, res, next) => {
  // const requestObject = { ...req.query };

  // const queryFields = ['sort', 'limit', 'page', 'filter'];

  // queryFields.forEach(field =>
  //   requestObject[field] ? delete requestObject[field] : null
  // );

  // sorting, filtering, limiting, pagination, aliases,
  const results = await User.getAll();

  res.status(statusCode.OK).json({
    status: 'success',
    data: {
      users: results,
    },
  });
});

export const getUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const result = await User.getOneById(id);
  res.status(statusCode.OK).json({
    status: 'success',
    user: result,
  });
});

export const updateUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const result = await User.updateOneById(id);
  res.status(statusCode.NO_CONTENT).json({
    status: 'success',
  });
});

export const deleteUser = asyncHandler(async (req, res, next) => {});

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
      new GlobalError(
        'Mobile number is required to create a member account',
        statusCode.BAD_REQUEST
      )
    );
  }
  if (!password) {
    return next(
      new GlobalError(
        'Please provide a password to create a member account',
        statusCode.BAD_REQUEST
      )
    );
  }

  const memberAlreadyExits = await User.getOne({ mobileNumber });

  if (memberAlreadyExits) {
    next(
      new GlobalError(
        'Please use another mobile number',
        statusCode.BAD_REQUEST
      )
    );
  }

  const newMember = await User.createOne(filteredMemberFields);
});
