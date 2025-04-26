const mongoose = require('mongoose');

const VisitedLandmarkSchema = new mongoose.Schema({
  landmark_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Landmark',
    required: true
  },
  visited_date: {
    type: Date,
    default: Date.now
  },
  visitor_name: {
    type: String,
    required: true,
    trim: true
  },
  notes: {
    type: String,
    default: ''
  }
});

module.exports = mongoose.model('VisitedLandmark', VisitedLandmarkSchema);