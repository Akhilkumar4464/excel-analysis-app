const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');
const ExcelFile = require('../models/ExcelFile');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /xlsx|xls|csv/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = /application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet|application\/vnd\.ms-excel|text\/csv/.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'));
    }
  }
});

// Upload Excel file
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const file = req.file;
    
    // Read Excel file
    const workbook = XLSX.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    // Create Excel file record
    const excelFile = new ExcelFile({
      filename: file.filename,
      originalName: file.originalname,
      filePath: file.path,
      fileSize: file.size,
      mimeType: file.mimetype,
      uploadedBy: req.user.userId,
      data: data,
      isProcessed: true
    });

    await excelFile.save();

    res.json({
      message: 'File uploaded successfully',
      file: {
        id: excelFile._id,
        originalName: excelFile.originalName,
        dataCount: data.length,
        uploadedAt: excelFile.uploadedAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all files for a user
router.get('/files', auth, async (req, res) => {
  try {
    const files = await ExcelFile.find({ uploadedBy: req.user.userId })
      .sort({ uploadedAt: -1 })
      .populate('uploadedBy', 'username email');
    
    res.json(files);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get specific file data
router.get('/files/:id', auth, async (req, res) => {
  try {
    const file = await ExcelFile.findOne({
      _id: req.params.id,
      uploadedBy: req.user.userId
    });

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.json(file);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete file
router.delete('/files/:id', auth, async (req, res) => {
  try {
    const file = await ExcelFile.findOne({
      _id: req.params.id,
      uploadedBy: req.user.userId
    });

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Delete file from filesystem
    if (fs.existsSync(file.filePath)) {
      fs.unlinkSync(file.filePath);
    }

    await ExcelFile.findByIdAndDelete(req.params.id);

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Analyze file data
router.get('/files/:id/analyze', auth, async (req, res) => {
  try {
    const file = await ExcelFile.findOne({
      _id: req.params.id,
      uploadedBy: req.user.userId
    });

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    const data = file.data;
    if (!data || data.length === 0) {
      return res.status(400).json({ message: 'No data to analyze' });
    }

    // Basic analysis
    const headers = Object.keys(data[0]);
    const totalRows = data.length;
    const totalColumns = headers.length;

    // Generate summary statistics
    const summary = {
      totalRows,
      totalColumns,
      headers,
      dataTypes: {}
    };

    // Analyze data types
    headers.forEach(header => {
      const values = data.map(row => row[header]).filter(val => val !== null && val !== undefined);
      const types = values.map(val => typeof val);
      const uniqueTypes = [...new Set(types)];
      summary.dataTypes[header] = uniqueTypes;
    });

    res.json({
      fileId: file._id,
      originalName: file.originalName,
      analysis: summary
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
