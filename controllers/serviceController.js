import GlobalError from '../error/GlobalError.js';
import asyncHandler from '../utils/asyncHandler.js';
import statusCode from '../utils/statusCode.js';
import Service from '../models/Service.js';
import Vehicle from '../models/Vehicle.js';

import { getOne, updateOne, deleteOne } from './factoryController.js';

// filtering, sorting
const validateFields = (fields, requiredFields) => {
  requiredFields.forEach(field => {
    if (!fields[field]) {
      throw new GlobalError(
        'Please provide all the required fields',
        statusCode.BAD_REQUEST
      );
    }
  });
};

export const createService = asyncHandler(async (req, res, next) => {
  const serviceToCreate = req.body;

  const result = await Service.create(
    image,
    serviceName,
    category,
    price,
    durationOfService,
    description,
    serviceDetails
  );

  res.status(statusCode.OK).json({
    status: 'success',
    data: result,
  });
});

export const getService = getOne(Service);

export const updateService = updateOne(Service);

export const deleteService = deleteOne(Service);

export const getAllServices = asyncHandler(async (req, res, next) => {
  const { vehicleId, modelName } = req.body;

  if (!vehicleId || !modelName) {
    return next(
      new GlobalError(
        'Please provide the vehicle id and vehicle model',
        statusCode.BAD_REQUEST
      )
    );
  }

  const vehicles = await Vehicle.getOneById(vehicleId);

  if (!vehicles) {
    return next(
      new GlobalError('Vehicle not found with this id', statusCode.NOT_FOUND)
    );
  }

  const vehicleModel = vehicles.models.find(
    vehicle => vehicle.modelName.toLowerCase() === modelName.toLowerCase()
  );

  if (!vehicleModel) {
    return next(
      new GlobalError('vehicle model not found', statusCode.NOT_FOUND)
    );
  }

  const services = await Service.getAll();

  services.forEach(service => {
    service.price += vehicleModel.price;
    // update the price and duration of the service according to the vehicle model
  });

  res.status(statusCode.OK).json({
    status: 'success',
    data: {
      length: services.length,
      data: services,
    },
  });
});
