import { ServiceCategory } from '../db/collections.js';

import { deleteOne, getAll, getOne, updateOne } from './factoryController.js';

export const getAllServicesCategories = getAll(ServiceCategory);
export const getServiceCategory = getOne(ServiceCategory);
export const updateServiceCategory = updateOne(ServiceCategory);
export const deleteServiceCategory = deleteOne(ServiceCategory);
