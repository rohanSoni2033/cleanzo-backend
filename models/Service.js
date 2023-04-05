import Factory from "./Factory.js";

export class ServiceDetailsDAO {
  constructor(image, title) {
    this.image = image;
    this.title = title;
  }
}

export class ServiceDAO {
  constructor(id, images, category, durationOfService, name, price,
    serviceDetails, description) {
    this.id = id;
    this.images = images;
    this.category = category;
    this.durationOfService = durationOfService;
    this.name = name;
    this.price = price;
    this.serviceDetails = serviceDetails;
    this.description = description;
  }
}

export default new Factory("services");