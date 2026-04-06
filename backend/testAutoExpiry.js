// Test script - Creates a booking that expires in 2 minutes
const mongoose = require('mongoose');
require('dotenv').config();

const Booking = require('./models/bookingModel');
const Slot = require('./models/slotModel');

const createTestBooking = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/parkingDB';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Find an available slot
    const availableSlot = await Slot.findOne({ isAvailable: true });
    if (!availableSlot) {
      console.log('❌ No available slots found');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Create booking that starts now and ends in 2 minutes
    const now = new Date();
    const endTime = new Date(now.getTime() + (2 * 60 * 1000)); // 2 minutes from now

    const booking = await Booking.create({
      name: 'Test User',
      vehicleNumber: 'TEST123',
      slotNumber: availableSlot.slotNumber,
      time: now.toISOString(),
      endTime: endTime.toISOString(),
      duration: 0.033, // 2 minutes in hours
      status: 'active'
    });

    // Mark slot as occupied
    availableSlot.isAvailable = false;
    await availableSlot.save();

    console.log('✅ Test booking created!');
    console.log(`   Slot: ${availableSlot.slotNumber}`);
    console.log(`   Vehicle: TEST123`);
    console.log(`   Start: ${now.toLocaleString()}`);
    console.log(`   End: ${endTime.toLocaleString()}`);
    console.log(`   Will expire in: 2 minutes`);
    console.log('\n⏰ Wait 2 minutes and refresh your page to see auto-expiry!');
    console.log('   The slot should automatically become available again.\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createTestBooking();
