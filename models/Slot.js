import Factory from "./Factory.js";

export class SlotDAO {
  constructor(id, time, date, totalBookingsInThisSlot, isAvailable) {
    this.id = id;
    this.time = time;
    this.date = date;
    this.totalBookingsInThisSlot = totalBookingsInThisSlot;
    this.isAvailable = isAvailable;
  }
}

export default new Factory("slots");