const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  specifications: {
    type: String,
    required: true
  },
  additionalNotes: {
    type: String
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Rejected'],
    default: 'Pending'
  },
  model: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Model'
  }
}, {
  timestamps: true
});

const Request = mongoose.model('Request', requestSchema);

module.exports = Request; 