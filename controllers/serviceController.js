import { ObjectId } from 'mongodb';
import GlobalError from '../error/GlobalError.js';
import asyncHandler from '../utils/asyncHandler.js';
import statusCode from '../utils/statusCode.js';
import { Service, Vehicle } from '../db/collections.js';
import { SERVICE_FOR } from '../utils/constants.js';
import { getOne } from './factoryController.js';

export const getService = getOne(Service);

export const getAllServices = asyncHandler(async (req, res, next) => {
  const { serviceFor } = req.query;

  if (!serviceFor) {
    return next(
      new GlobalError('please define the vehicle type', statusCode.BAD_REQUEST)
    );
  }

  let servicesList;

  if (serviceFor === SERVICE_FOR.BIKE) {
    servicesList = await Service.find({
      serviceFor,
    }).toArray();
  }

  if (serviceFor === SERVICE_FOR.CAR) {
    const { vehicleId } = req.query;

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

    servicesList = await Service.find({
      serviceFor,
    }).toArray();

    servicesList.forEach(service => {
      service.totalPrice =
        service.serviceBasePrice + vehicle.additionalServicePrice;

      service.regularPrice =
        service.regularPrice + vehicle.additionalServicePrice;

      delete service.serviceBasePrice;
    });
  }

  const groupedServiceList = servicesList.reduce((acc, service) => {
    const {
      _id,
      serviceCategoryId,
      serviceCategoryName,
      serviceName,
      durationOfService,
      description,
      serviceImageUrl,
      serviceDetails,
      totalPrice,
      regularPrice,
    } = service;

    const existingServiceIndex = acc.findIndex(
      group => group.serviceCategoryId === serviceCategoryId
    );

    if (existingServiceIndex >= 0) {
      acc[existingServiceIndex].services.push({
        _id,
        serviceName,
        durationOfService,
        description,
        serviceImageUrl,
        serviceDetails,
        totalPrice,
        regularPrice,
      });
    } else {
      acc.push({
        serviceCategoryId,
        serviceCategoryName,
        services: [
          {
            _id,
            serviceName,
            durationOfService,
            description,
            serviceImageUrl,
            serviceDetails,
            totalPrice,
            regularPrice,
          },
        ],
      });
    }

    return acc;
  }, []);

  return res.status(statusCode.OK).json({
    status: 'success',
    ok: true,
    content: true,
    data: groupedServiceList,
  });
});
