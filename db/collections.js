import database from './database.js';

export const ServiceCategory = database.collection('serviceCategories');
export const Service = database.collection('services');
export const Vehicle = database.collection('vehicles');

export const Booking = database.collection('bookings');
export const User = database.collection('users');
export const Slot = database.collection('slots');

export const MembershipPlan = database.collection('membershipPlans');
export const Membership = database.collection('memberships');
export const Payments = database.collection('payments');

export const BusinessRelated = database.collection('businessRelated');
