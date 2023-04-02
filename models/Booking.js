const bookingStatus = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELED: "canceled",
}

class Booking {
  constructor(
    id,
    userId,
    bookedServiceId,
    userVehicleId,
    totalPrice,
    status,
    paymentStatus,
    bookingLocation,
    bookingSlot
  ) {
    this.id = id;
    this.userId = userId;
    this.bookedServiceId = bookedServiceId;
    this.userVehicleModel = userVehicleModel;
    this.totalPrice = totalPrice;
    this.status = status;
    this.paymentStatus = paymentStatus;
    this.bookingLocation = bookingLocation;
    this.bookingSlot = bookingSlot;
  }

  static async create(userId, bookedServiceId, paymentStatus) {
    const createdAt = Date.now();
    const status = bookingStatus.PENDING;
  }
}