import db from "./../db/database.js";
class ServiceDetails {
  constructor(image, title) {
    this.image = image;
    this.title = title;
  }
}

const services = db.collection("services");

class Service {
  constructor(
    id,
    images,
    category,
    durationOfService,
    name,
    price,
    serviceDetails,
    description
  ) {
    this.id = id;
    this.images = images;
    this.category = category;
    this.durationOfService = durationOfService;
    this.name = name;
    this.price = price;
    this.serviceDetails = serviceDetails;
    this.description = description;
  }

  static async create(image, name, category, price, durationOfService, description, serviceDetails) {
    const result = await services.insertOne({
      name,
      category,
      durationOfService,
      image,
      price,
      description,
      serviceDetails,
      createAt: Date.now()
    });

    return result;
  }

  static async getAll() {
    const result = await services.find();
    return result;
  }

  static async getOne(filter) {
    const result = await services.findOne(filter);
    return result;
  }
}

export default Service;