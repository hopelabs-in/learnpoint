const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a module title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a module description']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  order: {
    type: Number,
    required: true
  },
  chapters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter'
  }],
  estimatedDuration: {
    type: Number, // in minutes
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Module', moduleSchema);
