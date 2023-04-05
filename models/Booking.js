import Factory from "./Factory";

export class BookingDAO {
  constructor(id, userId, bookedServiceId, userVehicleId, totalPrice, bookingStatus, paymentStatus, userAddress, userLocation, bookingSlot) {
    this.id = id;
    this.userId = userId;
    this.bookedServiceId = bookedServiceId;
    this.userVehicleId = userVehicleId;
    this.totalPrice = totalPrice;
    this.bookingStatus = bookingStatus;
    this.paymentStatus = paymentStatus;
    this.userAddress = userAddress;
    this.userLocation = userLocation;
    this.bookingSlot = bookingSlot;
  }
}

export default new Factory("bookings");