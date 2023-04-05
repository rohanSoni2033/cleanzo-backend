import Factory from './Factory.js';

export class UserDAO extends Factory {
  constructor(id, name, mobileNumber, email, address, location, vehicle, addressType, userType, membershipId, isActive, createdAt) {
    this.id = id;
    this.name = name;
    this.mobileNumber = mobileNumber;
    this.email = email;
    this.address = address;
    this.vehicle = vehicle;
    this.location = location;
    this.addressType = addressType;
    this.userType = userType;
    this.membershipId = membershipId;
    this.isActive = isActive;
    this.createdAt = createdAt;
  }
}

export default new Factory("users");