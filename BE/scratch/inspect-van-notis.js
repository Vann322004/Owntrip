const mongoose = require('mongoose');

const mongoUri = 'mongodb+srv://admin:admin@cluster0.y5hcrmq.mongodb.net/owntrip?retryWrites=true&w=majority';

async function run() {
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');

  const Notification = mongoose.model('Notification', new mongoose.Schema({}, { strict: false }));

  const notis = await Notification.find({ userId: 'UserId006' }).sort({ createdAt: -1 }).limit(10).lean();
  console.log('--- Notifications for UserId006 (Văn) ---');
  for (const n of notis) {
    console.log(`ID: ${n._id}, title: ${n.title}, isRead: ${n.isRead}, message: ${n.message}, createdAt: ${n.createdAt}`);
  }

  await mongoose.disconnect();
}

run().catch(console.error);
