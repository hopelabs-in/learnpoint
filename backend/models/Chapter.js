const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a chapter title'],
    trim: true
  },
  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: true
  },
  order: {
    type: Number,
    required: true
  },
  contentType: {
    type: String,
    enum: ['document', 'video', 'mixed'],
    required: true
  },
  content: {
    text: {
      type: String,
      default: ''
    },
    videoUrl: {
      type: String,
      default: ''
    },
    images: [{
      url: String,
      caption: String
    }]
  },
  estimatedDuration: {
    type: Number, // in minutes
    default: 5
  },
  completedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    completedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Chapter', chapterSchema);
