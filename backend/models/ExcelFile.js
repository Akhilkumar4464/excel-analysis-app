const mongoose = require('mongoose');

const excelFileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  analysis: {
    summary: {
      totalRows: Number,
      totalColumns: Number,
      headers: [String]
    },
    charts: [{
      type: String,
      title: String,
      data: mongoose.Schema.Types.Mixed
    }],
    insights: [String]
  },
  isProcessed: {
    type: Boolean,
    default: false
  },
  tags: [String],
  description: String
});

// Index for faster queries
excelFileSchema.index({ uploadedBy: 1, uploadedAt: -1 });
excelFileSchema.index({ filename: 'text', description: 'text' });

module.exports = mongoose.model('ExcelFile', excelFileSchema);
