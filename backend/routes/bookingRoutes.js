const express = require('express');
const router = express.Router();
const Booking = require('../models/bookingModel');
const Slot = require('../models/slotModel');

router.get('/', async (req, res) => {
  const bookings = await Booking.find();
  res.json(bookings);
});

router.post('/', async (req, res) => {
  try {
    const { name, vehicleNumber, slotNumber, time, duration = 3 } = req.body;
    const slot = await Slot.findOne({ slotNumber });
    if (!slot || !slot.isAvailable)
      return res.status(400).json({ message: 'Slot not available' });

    // Calculate end time (start time + duration in hours)
    const startTime = new Date(time);
    const endTime = new Date(startTime.getTime() + (duration * 60 * 60 * 1000));
    
    const booking = await Booking.create({ 
      name, 
      vehicleNumber, 
      slotNumber, 
      time,
      endTime: endTime.toISOString(),
      duration,
      status: 'active'
    });
    
    slot.isAvailable = false;
    await slot.save();
    res.json({ message: 'Booking successful', booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const slot = await Slot.findOne({ slotNumber: booking.slotNumber });
    if (slot) {
      slot.isAvailable = true;
      await slot.save();
    }

    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check and expire bookings that have passed their end time
router.get('/check-expired', async (req, res) => {
  try {
    const now = new Date();
    const expiredBookings = await Booking.find({
      status: 'active',
      endTime: { $lt: now.toISOString() }
    });

    const expiredIds = [];
    for (const booking of expiredBookings) {
      // Mark as expired
      booking.status = 'expired';
      await booking.save();
      
      // Free up the slot
      const slot = await Slot.findOne({ slotNumber: booking.slotNumber });
      if (slot) {
        slot.isAvailable = true;
        await slot.save();
      }
      
      expiredIds.push(booking._id);
    }

    res.json({ 
      message: `Expired ${expiredBookings.length} bookings`,
      expiredBookings: expiredIds
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
