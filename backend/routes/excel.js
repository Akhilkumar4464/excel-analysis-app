const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const XLSX = require('xlsx');
const ExcelFile = require('../models/ExcelFile');
const auth = require('../middleware/auth');
const router = express.Router();

// Rate limiting for file uploads
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 uploads per windowMs
  message: {
    message: 'Too many file uploads, please try again later',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads', 'excel');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Upload file
router.post('/upload', auth, uploadLimiter, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Read and parse the Excel file
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    // Create file record with parsed data
    const excelFile = new ExcelFile({
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      uploadedBy: req.user._id,
      data: jsonData,
      rowCount: jsonData.length,
      columns: jsonData.length > 0 ? Object.keys(jsonData[0]) : []
    });

    await excelFile.save();

    res.status(201).json({
      message: 'File uploaded successfully',
      file: excelFile,
      data: jsonData
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all files
router.get('/files', auth, async (req, res) => {
  try {
    const files = await ExcelFile.find({ uploadedBy: req.user._id })
      .populate('uploadedBy', 'username email')
      .sort({ uploadDate: -1 });

    res.json(files);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single file
router.get('/files/:id', auth, async (req, res) => {
  try {
    const file = await ExcelFile.findById(req.params.id)
      .populate('uploadedBy', 'username email');

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check if user owns the file or is admin
    if (file.uploadedBy._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(file);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete file
router.delete('/files/:id', auth, async (req, res) => {
  try {
    const file = await ExcelFile.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check if user owns the file or is admin
    if (file.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Delete file from filesystem
    if (fs.existsSync(file.path)) {
      await fs.promises.unlink(file.path);
    }

    await ExcelFile.findByIdAndDelete(req.params.id);

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Analyze file
router.get('/files/:id/analyze', auth, async (req, res) => {
  try {
    const file = await ExcelFile.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check if user owns the file or is admin
    if (file.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Placeholder for actual analysis
    // In a real application, you would use a library like xlsx to read and analyze the Excel file
    const analysis = {
      fileName: file.originalName,
      fileSize: file.size,
      uploadDate: file.uploadDate,
      rows: 0, // This would be calculated from actual file
      columns: 0, // This would be calculated from actual file
      summary: 'File analysis placeholder'
    };

    file.analysis = analysis;
    await file.save();

    res.json(analysis);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
