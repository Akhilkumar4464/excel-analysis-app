const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
    trim: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  data: [{
    type: mongoose.Schema.Types.Mixed
  }],
  columns: [{
    name: String,
    type: String,
    sample: mongoose.Schema.Types.Mixed
  }],
  rowCount: {
    type: Number,
    default: 0
  },
  columnCount: {
    type: Number,
    default: 0
  },
  isProcessed: {
    type: Boolean,
    default: false
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for faster queries
fileSchema.index({ user: 1, createdAt: -1 });
fileSchema.index({ filename: 1 });

module.exports = mongoose.model('File', fileSchema);
