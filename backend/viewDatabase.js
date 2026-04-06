// Script to view MongoDB database contents
const mongoose = require('mongoose');
require('dotenv').config();

const Booking = require('./models/bookingModel');
const Slot = require('./models/slotModel');

const viewDatabase = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/parkingDB';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Get all bookings
    const bookings = await Booking.find();
    console.log('='.repeat(50));
    console.log('📋 BOOKINGS (' + bookings.length + ' total)');
    console.log('='.repeat(50));
    if (bookings.length === 0) {
      console.log('No bookings found.\n');
    } else {
      bookings.forEach((booking, index) => {
        console.log(`\n${index + 1}. Booking ID: ${booking._id}`);
        console.log(`   Name: ${booking.name}`);
        console.log(`   Vehicle: ${booking.vehicleNumber}`);
        console.log(`   Slot: ${booking.slotNumber}`);
        console.log(`   Time: ${booking.time}`);
        console.log(`   Status: ${booking.status}`);
      });
      console.log('\n');
    }

    // Get all slots
    const slots = await Slot.find();
    console.log('='.repeat(50));
    console.log('🅿️  PARKING SLOTS (' + slots.length + ' total)');
    console.log('='.repeat(50));
    if (slots.length === 0) {
      console.log('No slots found.\n');
    } else {
      const available = slots.filter(s => s.isAvailable).length;
      const occupied = slots.length - available;
      console.log(`\nAvailable: ${available} | Occupied: ${occupied}\n`);
      
      // Show first 10 slots
      console.log('Slot Status:');
      slots.slice(0, 10).forEach(slot => {
        const status = slot.isAvailable ? '✅ Available' : '❌ Occupied';
        console.log(`   Slot ${slot.slotNumber}: ${status}`);
      });
      if (slots.length > 10) {
        console.log(`   ... and ${slots.length - 10} more slots`);
      }
      console.log('\n');
    }

    console.log('='.repeat(50));
    console.log('Database view complete!');
    console.log('='.repeat(50));

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

viewDatabase();
