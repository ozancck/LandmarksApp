const express = require('express');
const router = express.Router();
const { 
  getVisitedLandmarks, 
  getVisitedLandmarksByLandmarkId, 
  createVisitedLandmark, 
  updateVisitedLandmark, 
  deleteVisitedLandmark 
} = require('../notion/visited');

// GET all visited landmarks
router.get('/', async (req, res) => {
  try {
    const visitedLandmarks = await getVisitedLandmarks();
    res.json(visitedLandmarks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET visited landmarks by specific landmark ID
router.get('/:id', async (req, res) => {
  try {
    const visitedLandmarks = await getVisitedLandmarksByLandmarkId(req.params.id);
    res.json(visitedLandmarks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST record a visited landmark
router.post('/', async (req, res) => {
  try {
    const newVisitedLandmark = await createVisitedLandmark(req.body);
    res.status(201).json(newVisitedLandmark);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT/UPDATE a visited landmark record
router.put('/:id', async (req, res) => {
  try {
    const updatedVisitedLandmark = await updateVisitedLandmark(req.params.id, req.body);
    res.json(updatedVisitedLandmark);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a visited landmark record
router.delete('/:id', async (req, res) => {
  try {
    const result = await deleteVisitedLandmark(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;