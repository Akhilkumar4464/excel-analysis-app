const express = require('express');
const User = require('../models/User');
const superadminAuth = require('../middleware/superadminAuth');
const router = express.Router();

// Get all pending admin requests
router.get('/pending-admins', superadminAuth, async (req, res) => {
  try {
    const pendingAdmins = await User.find({ 
      role: 'pending_admin',
      isApproved: false 
    }).select('-password').sort({ createdAt: -1 });

    res.json(pendingAdmins);
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Get all admins (for management)
router.get('/admins', superadminAuth, async (req, res) => {
  try {
    const admins = await User.find({ 
      role: { $in: ['admin', 'superadmin'] } 
    }).select('-password').sort({ createdAt: -1 });

    res.json(admins);
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Approve admin request
router.post('/approve-admin/:id', superadminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'pending_admin') {
      return res.status(400).json({ message: 'User is not a pending admin' });
    }

    user.role = 'admin';
    user.isApproved = true;
    user.updatedAt = Date.now();
    await user.save();

    res.json({ 
      message: 'Admin request approved successfully', 
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Reject admin request
router.post('/reject-admin/:id', superadminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'pending_admin') {
      return res.status(400).json({ message: 'User is not a pending admin' });
    }

    user.role = 'user';
    user.isApproved = true;
    user.updatedAt = Date.now();
    await user.save();

    res.json({ 
      message: 'Admin request rejected successfully', 
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Revoke admin privileges
router.post('/revoke-admin/:id', superadminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'superadmin') {
      return res.status(400).json({ message: 'Cannot revoke superadmin privileges' });
    }

    user.role = 'user';
    user.isApproved = true;
    user.updatedAt = Date.now();
    await user.save();

    res.json({ 
      message: 'Admin privileges revoked successfully', 
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Get all users who can be promoted to admin (regular users)
router.get('/promotable-users', superadminAuth, async (req, res) => {
  try {
    const users = await User.find({ 
      role: 'user',
      isApproved: true
    }).select('-password').sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Promote user to admin (superadmin only)
router.post('/promote-to-admin/:id', superadminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'user') {
      return res.status(400).json({ message: 'User is not a regular user' });
    }

    user.role = 'admin';
    await user.save();

    res.json({ 
      message: 'User promoted to admin successfully',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get superadmin dashboard stats
router.get('/stats', superadminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const superadmins = await User.countDocuments({ role: 'superadmin' });
    const admins = await User.countDocuments({ role: 'admin' });
    const pendingAdmins = await User.countDocuments({ role: 'pending_admin' });
    const regularUsers = await User.countDocuments({ role: 'user' });

    res.json({
      totalUsers,
      superadmins,
      admins,
      pendingAdmins,
      regularUsers
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

module.exports = router;
