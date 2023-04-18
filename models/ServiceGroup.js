import Factory from './Factory.js';

class ServiceGroup {
  constructor(id, serviceGroupName, images) {
    this.id = id;
    this.serviceGroupName = serviceGroupName;
    this.images = images;
  }
}

export default new Factory('serviceGroups');
