import { ObjectId } from 'mongodb';
import GlobalError from '../error/GlobalError.js';
import asyncHandler from '../utils/asyncHandler.js';
import statusCode from '../utils/statusCode.js';
import { Service, Vehicle } from '../db/collections.js';

import { getOne, updateOne, deleteOne } from './factoryController.js';

export const createService = asyncHandler(async (req, res, next) => {
  const {
    serviceCategoryId,
    serviceCategoryName,
    serviceName,
    durationOfService,
    serviceBasePrice,
    description,
    image,
    details,
  } = req.body;

  await Service.insertOne({
    serviceCategoryId,
    serviceCategoryName,
    serviceName,
    durationOfService,
    serviceBasePrice,
    description,
    image,
    details,
  });

  res.status(statusCode.OK).json({
    status: 'success',
  });
});

export const getService = getOne(Service);

export const updateService = updateOne(Service);

export const deleteService = deleteOne(Service);

export const getAllServices = asyncHandler(async (req, res, next) => {
  const { vehicleId } = req.body;

  if (!vehicleId) {
    return next(
      new GlobalError('Please provide the vehicle id', statusCode.BAD_REQUEST)
    );
  }

  const vehicle = await Vehicle.findOne({ _id: new ObjectId(vehicleId) });

  if (!vehicle) {
    return next(
      new GlobalError('Vehicle not found with this id', statusCode.NOT_FOUND)
    );
  }

  const servicesList = await Service.find().toArray();

  servicesList.forEach(service => {
    service.totalPrice =
      service.serviceBasePrice + vehicle.additionalServicePrice;
    delete service.serviceBasePrice;
  });

  const groupedServiceList = servicesList.reduce((acc, obj) => {
    const key = obj.serviceCategoryName;

    delete obj.serviceCategoryId;
    delete obj.serviceCategoryName;

    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(obj);
    return acc;
  }, {});

  res.status(statusCode.OK).json({
    status: 'success',
    data: {
      length: groupedServiceList.length,
      services: groupedServiceList,
    },
  });
});
