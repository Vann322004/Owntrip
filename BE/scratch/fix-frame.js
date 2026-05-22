const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://admin:admin@cluster0.y5hcrmq.mongodb.net/owntrip?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    const framesCollection = mongoose.connection.db.collection('frames');
    
    // Update theo ID chính xác
    const updateResult = await framesCollection.updateOne(
      { _id: new mongoose.Types.ObjectId('6a106ac0c7626c45bf1fd9f6') },
      { 
        $set: { 
          layoutType: 'filmstrip-4',
          slotsCount: 4
        } 
      }
    );
    console.log('⚡ ID Update result:', updateResult);
    
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('❌ Connection error:', err);
  });
