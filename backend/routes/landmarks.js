const express = require('express');
const router = express.Router();
const Landmark = require('../models/Landmark');

// GET all landmarks
router.get('/', async (req, res) => {
  try {
    const landmarks = await Landmark.find();
    res.json(landmarks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET a specific landmark
router.get('/:id', async (req, res) => {
  try {
    const landmark = await Landmark.findById(req.params.id);
    if (!landmark) {
      return res.status(404).json({ message: 'Landmark not found' });
    }
    res.json(landmark);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new landmark
router.post('/', async (req, res) => {
  const landmark = new Landmark({
    name: req.body.name,
    location: {
      latitude: req.body.location.latitude,
      longitude: req.body.location.longitude
    },
    description: req.body.description,
    category: req.body.category,
    notes: req.body.notes
  });

  try {
    const newLandmark = await landmark.save();
    res.status(201).json(newLandmark);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT/UPDATE a landmark
router.put('/:id', async (req, res) => {
  try {
    const landmark = await Landmark.findById(req.params.id);
    if (!landmark) {
      return res.status(404).json({ message: 'Landmark not found' });
    }

    if (req.body.name) landmark.name = req.body.name;
    if (req.body.location) {
      landmark.location.latitude = req.body.location.latitude || landmark.location.latitude;
      landmark.location.longitude = req.body.location.longitude || landmark.location.longitude;
    }
    if (req.body.description) landmark.description = req.body.description;
    if (req.body.category) landmark.category = req.body.category;
    if (req.body.notes) landmark.notes = req.body.notes;

    const updatedLandmark = await landmark.save();
    res.json(updatedLandmark);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a landmark
router.delete('/:id', async (req, res) => {
  try {
    const landmark = await Landmark.findById(req.params.id);
    if (!landmark) {
      return res.status(404).json({ message: 'Landmark not found' });
    }
    
    await landmark.deleteOne();
    res.json({ message: 'Landmark deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;