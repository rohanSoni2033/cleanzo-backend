import asyncHandler from '../utils/asyncHandler.js';
import GlobalError from '../error/GlobalError.js';
import { deleteOne, getOne, updateOne } from './factoryController.js';
import statusCode from '../utils/statusCode.js';
import { Vehicle, User } from '../db/collections.js';
import { ObjectId } from 'mongodb';

export const getAllVehicles = asyncHandler(async (req, res, next) => {
  const vehicles = await Vehicle.find().toArray();

  const groupedVehicles = vehicles.reduce((acc, vehicle) => {
    const { _id, brand, logo, model } = vehicle;

    const existingBrandIndex = acc.findIndex(group => group.brand === brand);

    if (existingBrandIndex >= 0) {
      acc[existingBrandIndex].models.push({ _id, model, logo });
    } else {
      acc.push({
        brand: brand,
        logo: logo,
        models: [{ _id, model, logo }],
      });
    }

    return acc;
  }, []);

  res.status(statusCode.OK).json({
    status: 'success',
    ok: true,
    data: {
      length: groupedVehicles.length,
      data: groupedVehicles,
    },
  });
});

export const getVehicle = getOne(Vehicle);

export const updateVehicle = updateOne(Vehicle);

export const deleteVehicle = deleteOne(Vehicle);

export const getMyVehicles = asyncHandler(async (req, res, next) => {
  const { _id: userId } = req.user;

  const user = await User.findOne({ _id: new ObjectId(userId) });

  const vehicles = user.vehicles;

  res.status(statusCode.OK).json({
    status: 'success',
    ok: true,
    data: {
      length: vehicles.length,
      data: vehicles,
    },
  });
});

export const addMyVehicle = asyncHandler(async (req, res, next) => {
  const { vehicleId } = req.body;
  const { _id: userId } = req.user;

  if (!vehicleId) {
    return next(
      new GlobalError('Please provide the vehicle id', statusCode.BAD_REQUEST)
    );
  }

  const vehicle = await Vehicle.findOne({ _id: new ObjectId(vehicleId) });

  if (!vehicle) {
    return next(new GlobalError('Vehicle not found', statusCode.BAD_REQUEST));
  }

  const vehicleObject = {
    _id: vehicle._id,
    model: vehicle.model,
    logo: vehicle.logo,
  };

  const result = await User.updateOne(
    {
      _id: new ObjectId(userId),
      'vehicles._id': { $ne: new ObjectId(vehicleId) },
    },
    { $addToSet: { vehicles: vehicleObject } }
  );

  if (result.matchedCount > 0 && result.modifiedCount > 0) {
    return res.status(statusCode.OK).json({
      ok: true,
      status: 'success',
    });
  }

  res.status(statusCode.OK).json({
    status: 'fail',
    ok: false,
    message: `${vehicle.brand} ${vehicle.model} is already added`,
  });
});

export const removeMyVehicle = asyncHandler(async (req, res, next) => {
  const { _id: userId } = req.user;
  const vehicleId = req.params.vehicleId;

  const result = await User.updateOne(
    { _id: new ObjectId(userId) },
    { $pull: { vehicles: { _id: new ObjectId(vehicleId) } } }
  );

  if (result.matchedCount > 0 && result.modifiedCount > 0) {
    return res.status(statusCode.OK).json({
      status: 'success',
      ok: true,
    });
  }

  res.status(statusCode.OK).json({
    status: 'fail',
    ok: false,
    message: `${vehicleId} is not added in your account`,
  });
});
