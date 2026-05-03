import mongoose from 'mongoose';
import User from '../models/user.model';
import * as dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/owntrip';

async function checkUsers() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const users = await User.find({}).limit(10);
  console.log('Users:');
  users.forEach(u => {
    console.log(`Name: ${u.displayName}, Balance: ${u.balance}, ID: ${u.userId}`);
  });

  await mongoose.disconnect();
}

checkUsers().catch(console.error);
