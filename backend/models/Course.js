const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a course title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a course description']
  },
  thumbnail: {
    type: String,
    default: ''
  },
  tags: {
    department: {
      type: String,
      enum: ['IT', 'Ops', 'Onboarding', 'Risk', 'Product', 'Customer Service'],
      required: true
    },
    bank: {
      type: String,
      enum: ['SSFB', 'CUB', 'ESAF', 'All'],
      required: true
    }
  },
  modules: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module'
  }],
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  estimatedDuration: {
    type: Number, // in minutes
    default: 0
  }
}, {
  timestamps: true
});

// Virtual for progress calculation
courseSchema.virtual('totalChapters').get(function() {
  return this.modules.reduce((total, module) => {
    return total + (module.chapters ? module.chapters.length : 0);
  }, 0);
});

module.exports = mongoose.model('Course', courseSchema);
