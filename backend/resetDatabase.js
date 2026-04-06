// Script to reset the database - delete all slots and bookings
const mongoose = require('mongoose');
require('dotenv').config();

const Booking = require('./models/bookingModel');
const Slot = require('./models/slotModel');

const resetDatabase = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/parkingDB';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Delete all bookings
    const deletedBookings = await Booking.deleteMany({});
    console.log(`🗑️  Deleted ${deletedBookings.deletedCount} bookings`);

    // Delete all slots
    const deletedSlots = await Slot.deleteMany({});
    console.log(`🗑️  Deleted ${deletedSlots.deletedCount} slots`);

    console.log('\n✅ Database has been reset successfully!');
    console.log('You can now initialize 36 slots from the test page.\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

resetDatabase();
