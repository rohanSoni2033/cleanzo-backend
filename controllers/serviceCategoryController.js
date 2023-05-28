import { ServiceCategory } from '../db/collections.js';

import { getAll, getOne } from './factoryController.js';

export const getAllServicesCategories = getAll(ServiceCategory);
export const getServiceCategory = getOne(ServiceCategory);
