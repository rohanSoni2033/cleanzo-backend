import { Router } from "express";

const router = Router();

import { getAllBookings, getBooking, updateBooking, deleteBooking, createBooking, getAllBookingsByUser } from "./../controllers/bookingController.js";

router.get("/", getAllBookings);
router.get("/:id", getBooking);
router.post("/", createBooking);
router.patch("/:id", updateBooking);
router.delete("/:id", deleteBooking);
router.get("/:userId/bookings", getAllBookingsByUser);

export default router;