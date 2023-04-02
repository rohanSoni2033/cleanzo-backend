import GlobalError from '../error/GlobalError.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import statusCode from '../utils/statusCode.js';

const filterObject = (obj, allowedFields) => {
  const filteredObj = {};
  allowedFields.forEach(field => {
    if (obj[field]) {
      filteredObj[field] = obj[field];
    }
  });
  return filteredObj;
};

export const createMemberAccount = asyncHandler(async (req, res, next) => {
  const memberFields = req.body;

  const filteredMemberFields = filterObject(memberFields, ["fullname", "mobileNumber", "password", "userType", "address", "location"]);

  const { mobileNumber, password } = filteredMemberFields;

  if (!mobileNumber) {
    return next(new GlobalError("Mobile number is required to create a member account", statusCode.BAD_REQUEST));
  }
  if (!password) {
    return next(new GlobalError("Please provide a password to create a member account", statusCode.BAD_REQUEST));
  }

  const memberAlreadyExits = await User.findByMobileNumber(mobileNumber);

  if (memberAlreadyExits) {
    next(new GlobalError("Please use another mobile number", statusCode.BAD_REQUEST));
  }

  const newMember = await User.createOne(filteredMemberFields);
});

export const updateMeController = asyncHandler(async (req, res, next) => {
  // Get the all the fields that came with the request and filter it
  const fieldsObjForUpdate = req.body;

  // User allowed only to change their name, address and vehicle directly (with verification)
  // so, we will remove all the other field and empty field from the object

  const fieldsToUpdate = filterObject(fieldsObjForUpdate, [
    'name',
    'vehicle',
    'address',
    'email',
  ]);

  // We need the id of current logged in user
  // we can get the id from the req.body because it is a protected route so req.body must have an id field by now

  const currentUserId = req['id'];

  // now we have the id and filtered object for update so, we can call the updateById method from user model class
  const result = await User.updateById(currentUserId, fieldsToUpdate);

  res.status(200).json({
    status: 'ok',
  });
});

const updateCurrentUserMobile = asyncHandler(async (req, res, next) => { });
