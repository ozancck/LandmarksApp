const express = require('express');
const router = express.Router();
const { 
  getLandmarks, 
  getLandmark, 
  createLandmark, 
  updateLandmark, 
  deleteLandmark 
} = require('../notion/landmarks');

// GET all landmarks
router.get('/', async (req, res) => {
  try {
    const landmarks = await getLandmarks();
    res.json(landmarks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET a specific landmark
router.get('/:id', async (req, res) => {
  try {
    const landmark = await getLandmark(req.params.id);
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
  try {
    const newLandmark = await createLandmark(req.body);
    res.status(201).json(newLandmark);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT/UPDATE a landmark
router.put('/:id', async (req, res) => {
  try {
    const updatedLandmark = await updateLandmark(req.params.id, req.body);
    res.json(updatedLandmark);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a landmark
router.delete('/:id', async (req, res) => {
  try {
    const result = await deleteLandmark(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;