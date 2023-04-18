import Factory from './Factory.js';

export class ServiceDAO {
  constructor(
    id,
    serviceGroupId,
    images,
    durationOfService,
    serviceName,
    price,
    serviceDetails,
    description
  ) {
    this.id = id;
    this.serviceGroupId = serviceGroupId;
    this.images = images;
    this.durationOfService = durationOfService;
    this.serviceName = serviceName;
    this.price = price;
    this.serviceDetails = serviceDetails;
    this.description = description;
  }
}

export default new Factory('services');
