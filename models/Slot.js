import Factory from './Factory.js';

export class SlotDAO {
  constructor(id, slotDate, slotTime, totalBookings, isAvailable) {
    this.id = id;
    this.slotDate = slotDate;
    this.slotTime = slotTime;
    this.totalBookings = totalBookings;
    this.isAvailable = isAvailable;
  }
}

export default new Factory('slots');
