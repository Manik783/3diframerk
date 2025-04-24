const mongoose = require('mongoose');

const modelSchema = new mongoose.Schema({
  request: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request',
    required: true
  },
  glbFile: {
    type: String,
    required: true
  },
  usdzFile: {
    type: String,
    required: true
  },
  posterImage: {
    type: String
  },
  embedCode: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const Model = mongoose.model('Model', modelSchema);

module.exports = Model; 