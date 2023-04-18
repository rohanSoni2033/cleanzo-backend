import asyncHandler from '../utils/asyncHandler';
import statusCode from '../utils/statusCode';
import MembershipPlan from '../models/MembershipPlan';
import Factory from '../models/Factory';

export const getAllMembershipPlan = asyncHandler(async (req, res, next) => {
  const membershipPlans = await MembershipPlan.getAll();
  res.status(statusCode.OK).json({
    status: 'success',
    plans: membershipPlans,
  });
});

export const updateMembershipPlan = asyncHandler(async (req, res, next) => {
  const membership = await MembershipPlan.updateOne();
});

export const deleteMembershipPlan = Factory;
