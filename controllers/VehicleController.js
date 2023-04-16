import asyncHandler from '../utils/asyncHandler.js';
import Vehicle from './../models/Vehicle.js';
import { deleteOne, getAll, getOne, updateOne } from './factoryController.js';

export const getAllVehicles = getAll(Vehicle);

export const getVehicle = getOne(Vehicle);

export const updateVehicle = updateOne(Vehicle);

export const deleteVehicle = deleteOne(Vehicle);
