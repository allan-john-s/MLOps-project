// Script to initialize exactly 36 parking slots
const mongoose = require('mongoose');
require('dotenv').config();

const Slot = require('./models/slotModel');

const initializeSlots = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/parkingDB';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Check if slots already exist
    const existingSlots = await Slot.countDocuments();
    if (existingSlots > 0) {
      console.log(`⚠️  Database already has ${existingSlots} slots.`);
      console.log('Run resetDatabase.js first if you want to reinitialize.\n');
      await mongoose.connection.close();
      process.exit(0);
    }

    console.log('🚀 Initializing 36 parking slots...\n');

    // Create 36 slots
    const slots = [];
    for (let i = 1; i <= 36; i++) {
      slots.push({
        slotNumber: i,
        isAvailable: true
      });
    }

    await Slot.insertMany(slots);
    
    console.log('✅ Successfully created 36 parking slots!');
    console.log('\nSlots 1-36 are now available in MongoDB.');
    console.log('You can view them in MongoDB Compass or the test page.\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

initializeSlots();
