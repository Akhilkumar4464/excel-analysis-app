const express = require('express');
const File = require('../models/File');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/data/file/:id
// @desc    Get processed file data
// @access  Private
router.get('/file/:id', auth, async (req, res) => {
  try {
    const file = await File.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    });

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    if (!file.isProcessed) {
      return res.status(400).json({ message: 'File not processed yet' });
    }

    res.json({
      success: true,
      data: file.data,
      columns: file.columns,
      rowCount: file.rowCount,
      columnCount: file.columnCount
    });
  } catch (error) {
    console.error('Get file data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/data/file/:id/summary
// @desc    Get data summary for a file
// @access  Private
router.get('/file/:id/summary', auth, async (req, res) => {
  try {
    const file = await File.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    });

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    if (!file.isProcessed) {
      return res.status(400).json({ message: 'File not processed yet' });
    }

    const summary = {
      totalRows: file.rowCount,
      totalColumns: file.columnCount,
      columns: file.columns.map(col => ({
        name: col.name,
        type: col.type,
        uniqueValues: 0,
        nullValues: 0,
        sampleData: []
      }))
    };

    // Calculate statistics for each column
    file.columns.forEach((col, index) => {
      const values = file.data.map(row => row[col.name]).filter(val => val !== null && val !== undefined);
      const uniqueValues = [...new Set(values)];
      
      summary.columns[index].uniqueValues = uniqueValues.length;
      summary.columns[index].nullValues = file.rowCount - values.length;
      summary.columns[index].sampleData = values.slice(0, 5);
      
      if (col.type === 'number') {
        const numericValues = values.map(v => parseFloat(v)).filter(v => !isNaN(v));
        if (numericValues.length > 0) {
          summary.columns[index].statistics = {
            min: Math.min(...numericValues),
            max: Math.max(...numericValues),
            avg: numericValues.reduce((a, b) => a + b, 0) / numericValues.length,
            sum: numericValues.reduce((a, b) => a + b, 0)
          };
        }
      }
    });

    res.json({
      success: true,
      summary
    });
  } catch (error) {
    console.error('Get data summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/data/file/:id/chart-data
// @desc    Get chart-ready data for a specific column
// @access  Private
router.get('/file/:id/chart-data', auth, async (req, res) => {
  try {
    const { column, chartType } = req.query;
    
    if (!column) {
      return res.status(400).json({ message: 'Column parameter is required' });
    }

    const file = await File.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    });

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    if (!file.isProcessed) {
      return res.status(400).json({ message: 'File not processed yet' });
    }

    const columnData = file.data.map(row => row[column]).filter(val => val !== null && val !== undefined);
    
    if (columnData.length === 0) {
      return res.status(400).json({ message: 'No data found for this column' });
    }

    let chartData = {};

    // Determine if column is categorical or numeric
    const isNumeric = columnData.every(val => !isNaN(parseFloat(val)) && isFinite(val));
    
    if (isNumeric && chartType !== 'pie' && chartType !== 'doughnut') {
      // Numeric data for bar/line charts
      const labels = file.data.map((row, index) => row[column] ? `Row ${index + 1}` : `Row ${index + 1}`);
      
      // Find numeric columns for datasets
      const numericColumns = file.columns.filter(col => {
        if (col.name === column) return false;
        const values = file.data.map(row => row[col.name]).filter(val => val !== null && val !== undefined);
        return values.every(val => !isNaN(parseFloat(val)) && isFinite(val));
      });

      const datasets = numericColumns.map((col, index) => ({
        label: col.name,
        data: file.data.map(row => parseFloat(row[col.name]) || 0),
        backgroundColor: `hsl(${index * 60}, 70%, 50%)`,
        borderColor: `hsl(${index * 60}, 70%, 50%)`,
        borderWidth: 2,
        fill: chartType === 'line' ? false : true
      }));

      chartData = {
        labels,
        datasets
      };
    } else {
      // Categorical data for pie/doughnut charts
      const counts = {};
      columnData.forEach(val => {
        const strVal = String(val);
        counts[strVal] = (counts[strVal] || 0) + 1;
      });

      const colors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
        '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
      ];

      chartData = {
        labels: Object.keys(counts),
        datasets: [{
          label: column,
          data: Object.values(counts),
          backgroundColor: colors.slice(0, Object.keys(counts).length),
          borderWidth: 2
        }]
      };
    }

    res.json({
      success: true,
      chartData,
      columnType: isNumeric ? 'numeric' : 'categorical'
    });
  } catch (error) {
    console.error('Get chart data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/data/recent
// @desc    Get recent files data
// @access  Private
router.get('/recent', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    const files = await File.find({ 
      user: req.user.id,
      isProcessed: true 
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('originalName rowCount columnCount createdAt');

    res.json({
      success: true,
      files
    });
  } catch (error) {
    console.error('Get recent data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
