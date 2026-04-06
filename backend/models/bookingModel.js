const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  vehicleNumber: { type: String, required: true },
  slotNumber: { type: Number, required: true },
  time: { type: Date, required: true },
  endTime: { type: Date, required: true },
  duration: { type: Number, default: 3 },
  status: { type: String, default: 'active' } // active, expired, cancelled
});

module.exports = mongoose.model('Booking', bookingSchema);