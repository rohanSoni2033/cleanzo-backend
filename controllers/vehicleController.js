import asyncHandler from '../utils/asyncHandler.js';
import Vehicle from '../models/Vehicle.js';
import GlobalError from '../error/GlobalError.js';
import { deleteOne, getAll, getOne, updateOne } from './factoryController.js';
import statusCode from '../utils/statusCode.js';

export const createVehicle = asyncHandler(async (req, res, next) => {
  const { name, logo, models } = req.body;

  if (!name || !logo || !models) {
    return next(
      new GlobalError('Please define all the required fields', statusCode.OK)
    );
  }

  await Vehicle.createOne({
    name,
    logo,
    models,
  });

  res.status(statusCode.OK).json({
    status: 'success',
  });
});

export const getAllVehicles = getAll(Vehicle);

export const getVehicle = getOne(Vehicle);

export const updateVehicle = updateOne(Vehicle);

export const deleteVehicle = deleteOne(Vehicle);

// api/v1.0/vehicles/643cf529a4af2bfc157aadce/models
export const getModelOfVehicle = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { modelName } = req.body;

  if (!modelName) {
    next(
      new GlobalError('Please provide the model name', statusCode.BAD_REQUEST)
    );
  }

  const vehicle = await Vehicle.getOneById(id);

  const model = vehicle.models.find(value => value === modelName);

  res.status(statusCode.OK).json({
    status: 'success',
    data: {
      model,
    },
  });
});
