import Factory from "./Factory.js";

export class VehicleModelDAO {
  constructor(id, modelName, price) {
    this.id = id;
    this.modelName = modelName;
    this.price = price;
  }
}

export class VehicleDAO {
  constructor(id, brandIconImageLink, vehicleBrandName, models, category, price) {
    this.id = id;
    this.brandIconImageLink = brandIconImageLink;
    this.vehicleBrandName = vehicleBrandName;
    this.models = models;
    this.category = category;
    this.price = price;
  }
}

export default new Factory("vehicles"); 
