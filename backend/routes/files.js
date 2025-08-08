const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');
const File = require('../models/File');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
    cb(null, true);
  } else {
    cb(new Error('Only .xlsx files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB
  }
});

// @route   POST /api/files/upload
// @desc    Upload Excel file
// @access  Private
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const file = new File({
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      user: req.user.id
    });

    await file.save();

    res.json({
      success: true,
      file: {
        id: file._id,
        filename: file.filename,
        originalName: file.originalName,
        size: file.size,
        uploadedAt: file.createdAt
      }
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ message: 'Server error during file upload' });
  }
});

// @route   GET /api/files
// @desc    Get all files for current user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const files = await File.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await File.countDocuments({ user: req.user.id });

    res.json({
      success: true,
      files,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/files/:id
// @desc    Get single file details
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const file = await File.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    });

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.json({
      success: true,
      file
    });
  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/files/:id
// @desc    Delete a file
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const file = await File.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    });

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Delete file from filesystem
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    await File.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/files/:id/process
// @desc    Process Excel file and extract data
// @access  Private
router.post('/:id/process', auth, async (req, res) => {
  try {
    const file = await File.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    });

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    if (!fs.existsSync(file.path)) {
      return res.status(404).json({ message: 'File not found on disk' });
    }

    // Read Excel file
    const workbook = XLSX.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    // Extract column information
    const columns = [];
    if (data.length > 0) {
      const firstRow = data[0];
      Object.keys(firstRow).forEach(key => {
        const values = data.map(row => row[key]).filter(val => val !== null && val !== undefined);
        const type = values.length > 0 ? typeof values[0] : 'string';
        
        columns.push({
          name: key,
          type: type,
          sample: values.length > 0 ? values[0] : null
        });
      });
    }

    // Update file with processed data
    file.data = data;
    file.columns = columns;
    file.rowCount = data.length;
    file.columnCount = columns.length;
    file.isProcessed = true;
    file.metadata = {
      sheetName,
      workbook: {
        sheetNames: workbook.SheetNames,
        props: workbook.Props
      }
    };

    await file.save();

    res.json({
      success: true,
      message: 'File processed successfully',
      file: {
        id: file._id,
        originalName: file.originalName,
        rowCount: file.rowCount,
        columnCount: file.columnCount,
        columns: file.columns
      }
    });
  } catch (error) {
    console.error('Process file error:', error);
    res.status(500).json({ message: 'Server error during file processing' });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large' });
    }
    return res.status(400).json({ message: error.message });
  }
  next(error);
});

module.exports = router;
