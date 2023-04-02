import { ObjectId } from 'mongodb';
import db from '../db/database.js';

const userType = {
  ADMIN: 'admin',
  USER: 'user',
  EMPLOYEE: 'employee',
};

class Location {
  constructor(lat, long) {
    this.lat = lat;
    this.long = long;
  }
}

const userCollection = db.collection('users');

class User {
  constructor(
    id,
    name,
    phone,
    email,
    address,
    vehicle,
    location,
    createdAt,
    userType,
    membership
  ) {
    this.id = id;
    this.name = name;
    this.phone = phone;
    this.email = email;
    this.address = address;
    this.vehicle = vehicle;
    this.location = location;
    this.userType = userType;
    this.membership = membership;
  }

  static async save(mobileNumber, userType = 'user') {
    const { insertedId: id } = await userCollection.insertOne({
      mobileNumber,
      createdAt: Date.now(),
      userType,
    });
    return id.toString('hex');
  }

  static async findOneWithFilter(filter) {
    const result = await userCollection.findOne(filter);
    return result;
  }

  static async findById(id) {
    const result = await userCollection.findOne({ _id: new ObjectId(id) });
    return result;
  }

  static async findByMobileNumber(mobileNumber) {
    const user = await userCollection.findOne({ mobileNumber });
    return user ? user._id.toString() : null;
  }

  static async deleteById(id) {
    await userCollection.findOneAndDelete({ _id: new ObjectId(id) });
  }

  static async updateById(id, data) {
    // console.log(id);
    const result = await userCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: data }
    );
    // console.log(result);

    return result;
  }

  static async updateMany(filter) {
    await userCollection.updateMany(filter);
  }

  static async deleteMany(filter) {
    await userCollection.deleteMany(filter);
  }
}

export default User;
