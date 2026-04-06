const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
const bookingRoutes = require('./routes/bookingRoutes');
app.use('/api/bookings', bookingRoutes);

const Slot = require('./models/slotModel');
app.get('/api/slots', async (req, res) => {
  try {
    const slots = await Slot.find().sort('slotNumber');
    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
app.post('/api/slots', async (req, res) => {
  try {
    const { slotNumber } = req.body;
    const slot = await Slot.create({ slotNumber });
    res.json(slot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 5001;
const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/parkingDB';

mongoose.connect(mongoUri)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('MongoDB connection error:', err));