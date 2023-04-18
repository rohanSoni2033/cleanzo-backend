import ServiceGroup from '../models/ServiceGroup.js';
import { deleteOne, getAll, getOne, updateOne } from './factoryController.js';

export const getAllServiceGroups = getAll(ServiceGroup);
export const getServiceGroup = getOne(ServiceGroup);
export const updateServiceGroup = updateOne(ServiceGroup);
export const deleteServiceGroup = deleteOne(ServiceGroup);
