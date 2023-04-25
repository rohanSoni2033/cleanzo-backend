import asyncHandler from '../utils/asyncHandler.js';
import Vehicle from '../models/Vehicle.js';
import GlobalError from '../error/GlobalError.js';
import { deleteOne, getOne, updateOne } from './factoryController.js';
import statusCode from '../utils/statusCode.js';

export const createVehicle = asyncHandler(async (req, res, next) => {
  const { brand, logo, model } = req.body;

  if (!brand || !logo || !model) {
    return next(
      new GlobalError('Please define all the required fields', statusCode.OK)
    );
  }

  await Vehicle.createOne({ brand, logo, model });

  res.status(statusCode.CREATED).json({ status: 'success' });
});

export const getAllVehicles = asyncHandler(async (req, res, next) => {
  const vehicles = await Vehicle.getAll();

  const groupedVehicles = vehicles.reduce((acc, vehicle) => {
    const { _id, brand, logo, model } = vehicle;

    const existingBrandIndex = acc.findIndex(group => group.brand === brand);

    if (existingBrandIndex >= 0) {
      acc[existingBrandIndex].models.push({ _id, model });
    } else {
      acc.push({
        brand: brand,
        logo: logo,
        models: [{ _id, model }],
      });
    }

    return acc;
  }, []);

  res.status(statusCode.OK).json({
    status: 'success',
    data: {
      length: groupedVehicles.length,
      vehicles: groupedVehicles,
    },
  });
});

export const getVehicle = getOne(Vehicle);

export const updateVehicle = updateOne(Vehicle);

export const deleteVehicle = deleteOne(Vehicle);
