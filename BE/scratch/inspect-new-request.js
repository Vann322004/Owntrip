const mongoose = require('mongoose');

const mongoUri = 'mongodb+srv://admin:admin@cluster0.y5hcrmq.mongodb.net/owntrip?retryWrites=true&w=majority';

async function run() {
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');

  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const Notification = mongoose.model('Notification', new mongoose.Schema({}, { strict: false }));
  const HotelRequest = mongoose.model('HotelRequest', new mongoose.Schema({}, { strict: false }));

  // Find all requests named "a"
  const requests = await HotelRequest.find({ hotelName: 'a' }).sort({ createdAt: -1 }).lean();
  console.log(`Found ${requests.length} requests named "a"`);
  for (const r of requests) {
    console.log(`Request ID: ${r._id}, status: ${r.status}, createdAt: ${r.createdAt}`);
  }

  // Find notifications for the admin
  const admin = await User.findOne({ role: 'admin' }).lean();
  if (admin) {
    const adminNotis = await Notification.find({ userId: admin.userId }).sort({ createdAt: -1 }).limit(10).lean();
    console.log(`\n--- Latest Admin Notifications (userId: ${admin.userId}) ---`);
    for (const n of adminNotis) {
      console.log(`ID: ${n._id}, title: ${n.title}, message: ${n.message}, createdAt: ${n.createdAt}`);
    }
  }

  await mongoose.disconnect();
}

run().catch(console.error);
