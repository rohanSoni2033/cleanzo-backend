import Factory from './Factory.js';

export class BookingDAO {
  constructor(
    id,
    userId,
    bookedServiceId,
    userVehicleId,
    totalPrice,
    bookingStatus,
    paymentStatus,
    userAddress,
    userLocation,
    bookingSlot
  ) {
    this.id = id;
    this.userId = userId; // -> User
    this.bookedServiceId = bookedServiceId; //  -> Booking
    this.userVehicleId = userVehicleId; // -> Vehicle
    this.totalPrice = totalPrice;
    this.bookingStatus = bookingStatus;
    this.paymentStatus = paymentStatus;
    this.userAddress = userAddress;
    this.userLocation = userLocation;
    this.bookingSlot = bookingSlot;
  }
}

export default new Factory('bookings');
