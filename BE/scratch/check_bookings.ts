import mongoose from 'mongoose';
import Booking from '../models/booking.model';
import Hotel from '../models/hotel.model';
import User from '../models/user.model';
import RoomInventory from '../models/roomInventory.model';
import * as dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/owntrip';

async function checkBookings() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const bookings = await Booking.find({}).limit(5).sort({ createdAt: -1 });
  console.log('Last 5 bookings:');
  bookings.forEach(b => {
    console.log(`ID: ${b.bookingId}, HotelId: ${b.hotelId}, User: ${b.guestInfo.fullName}, Status: ${b.status}`);
  });

  const hotels = await Hotel.find({}).limit(5);
  console.log('\nLast 5 hotels:');
  hotels.forEach(h => {
    console.log(`Name: ${h.name}, HotelId: ${h.hotelId}, MongoDB _id: ${h._id}`);
  });

  await mongoose.disconnect();
}

checkBookings().catch(console.error);
