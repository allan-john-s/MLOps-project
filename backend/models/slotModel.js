const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  slotNumber: { type: Number, required: true, unique: true },
  isAvailable: { type: Boolean, default: true }
});

module.exports = mongoose.model('Slot', slotSchema);