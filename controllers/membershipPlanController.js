import asyncHandler from '../utils/asyncHandler.js';
import statusCode from '../utils/statusCode.js';
import { MembershipPlan, Vehicle } from '../db/collections.js';
import { ObjectId } from 'mongodb';
import { deleteOne, updateOne } from './factoryController.js';
import GlobalError from '../error/GlobalError.js';

export const getAllMembershipPlans = asyncHandler(async (req, res, next) => {
  // client needs to add the vehicleId in request body
  const { vehicleId } = req.body;

  // we will check whether the vehicleId exists or not, if not then throw the error back to the user in response
  if (!vehicleId) {
    return next(
      new GlobalError('Vehicle id is not defined', statusCode.BAD_REQUEST)
    );
  }

  // find the vehicle using vehicleId
  const vehicle = await Vehicle.findOne({ _id: new ObjectId(vehicleId) });

  // check whether the vehicle exits or not, if vehicle doesn't exits it means that the vehicleId is invalid, throw the error back to the user in response
  if (!vehicle) {
    return next(new GlobalError('vehicle not found', statusCode.NOT_FOUND));
  }

  // get all the membership plans using find method on the from the membership collection and covert that into an array
  const membershipPlans = await MembershipPlan.find().toArray();

  membershipPlans.forEach(plan => {
    plan.durations.forEach(duration => {
      duration.totalPrice =
        duration.planBasePrice +
        vehicle.additionalServicePrice * duration.duration;
      duration.planRegularPrice +=
        vehicle.additionalServicePrice * duration.duration;
      delete duration.planBasePrice;
    });
  });

  // send the data back to user with success status
  res.status(statusCode.OK).json({
    status: 'success',
    data: {
      length: membershipPlans.length,
      data: membershipPlans,
    },
  });
});

export const getMembershipPlan = asyncHandler(async (req, res, next) => {
  const { membershipPlanId } = req.params;

  const membershipPlan = await MembershipPlan.findOne({
    _id: new ObjectId(membershipPlanId),
  });

  res.status(statusCode.OK).json({
    status: 'success',
    data: membershipPlan,
  });
});

export const deleteMembershipPlan = deleteOne(MembershipPlan);
export const updateMembershipPlan = updateOne(MembershipPlan);
