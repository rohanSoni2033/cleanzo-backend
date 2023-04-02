import asyncHandler from "./../utils/asyncHandler.js";

export const getAllBookings = asyncHandler((req, res, next) => { });
export const getBooking = asyncHandler((req, res, next) => { });
export const createBooking = asyncHandler((req, res, next) => {
    const { userId, serviceId, bookingSlot } = req.body;
});
export const deleteBooking = asyncHandler((req, res, next) => { });
export const updateBooking = asyncHandler((req, res, next) => { });

export const getAllBookingsByUser = asyncHandler((req, res, next) => { });