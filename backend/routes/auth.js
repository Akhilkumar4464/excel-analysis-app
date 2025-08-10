const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role = 'user' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Set approval status based on role
    const isAdmin = role === 'admin';
    const approvalStatus = isAdmin ? 'pending' : 'approved';
    const isApproved = !isAdmin;

    // Create new user
    const user = new User({
      username,
      email,
      password,
      role: isAdmin ? 'user' : 'user', // Start as user, upgrade after approval
      requestedRole: role,
      approvalStatus,
      isApproved
    });
    await user.save();

    // Generate token only for approved users
    if (!isAdmin) {
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      
      res.status(201).json({
        message: 'User created successfully',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          approvalStatus: user.approvalStatus
        }
      });
    } else {
      res.status(201).json({
        message: 'Admin registration submitted for approval',
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          approvalStatus: user.approvalStatus
        }
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if admin is approved
    if (user.requestedRole === 'admin' && user.approvalStatus !== 'approved') {
      if (user.approvalStatus === 'pending') {
        return res.status(403).json({ 
          message: 'Admin registration is pending approval',
          approvalStatus: 'pending'
        });
      } else if (user.approvalStatus === 'rejected') {
        return res.status(403).json({ 
          message: 'Admin registration has been rejected',
          approvalStatus: 'rejected'
        });
      }
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update role if admin is approved
    let finalRole = user.role;
    if (user.requestedRole === 'admin' && user.approvalStatus === 'approved') {
      finalRole = 'admin';
    }

    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: finalRole,
        approvalStatus: user.approvalStatus
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    
    // Update role if admin is approved
    let finalRole = user.role;
    if (user.requestedRole === 'admin' && user.approvalStatus === 'approved') {
      finalRole = 'admin';
    }

    res.json({
      ...user.toObject(),
      role: finalRole
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get pending admin registrations (for super admin)
router.get('/pending-admins', auth, async (req, res) => {
  try {
    // Check if user is admin
    const requestingUser = await User.findById(req.user.userId);
    if (requestingUser.requestedRole !== 'admin' || requestingUser.approvalStatus !== 'approved') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const pendingAdmins = await User.find({
      requestedRole: 'admin',
      approvalStatus: 'pending'
    }).select('-password');

    res.json(pendingAdmins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve admin registration
router.put('/approve-admin/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    const requestingUser = await User.findById(req.user.userId);
    if (requestingUser.requestedRole !== 'admin' || requestingUser.approvalStatus !== 'approved') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { 
        approvalStatus: 'approved',
        role: 'admin',
        isApproved: true
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      message: 'Admin approved successfully', 
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: 'admin',
        approvalStatus: 'approved'
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reject admin registration
router.put('/reject-admin/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    const requestingUser = await User.findById(req.user.userId);
    if (requestingUser.requestedRole !== 'admin' || requestingUser.approvalStatus !== 'approved') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { 
        approvalStatus: 'rejected',
        isApproved: false
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      message: 'Admin registration rejected', 
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        approvalStatus: 'rejected'
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { firstName, lastName } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { 'profile.firstName': firstName, 'profile.lastName': lastName },
      { new: true }
    ).select('-password');

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
