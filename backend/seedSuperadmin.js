const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function createSuperadmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Check if superadmin already exists
    const existingSuperadmin = await User.findOne({ username: 'akhil4464' });
    
    if (existingSuperadmin) {
      console.log('Superadmin user "akhil4464" already exists');
      console.log('User details:', {
        username: existingSuperadmin.username,
        email: existingSuperadmin.email,
        role: existingSuperadmin.role
      });
      process.exit(0);
    }

    // Create superadmin user
    const superadmin = new User({
      username: 'akhil4464',
      email: 'akhil4464@example.com',
      password: 'SuperAdmin@123', // Change this password after first login
      role: 'superadmin',
      isApproved: true
    });

    await superadmin.save();
    
    console.log('✅ Superadmin user created successfully!');
    console.log('Login Details:');
    console.log('Username: akhil4464');
    console.log('Email: akhil4464@example.com');
    console.log('Password: SuperAdmin@123');
    console.log('Role: superadmin');

  } catch (error) {
    console.error('Error creating superadmin:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createSuperadmin();
