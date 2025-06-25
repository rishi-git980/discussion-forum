import mongoose from 'mongoose';
import User from '../models/User.js';

const ALLOWED_ADMIN_EMAILS = [
  'varunrajsirimalla02@gmail.com',
  'rishinalike@gmail.com',
  'saikrishnareddygampala@gmail.com',
  'kallemakshitha2004@gmail.com'
];

const updateAdmins = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/forumhub');
    console.log('Connected to MongoDB');

    // Remove admin role from all users except the allowed emails
    await User.updateMany(
      { email: { $nin: ALLOWED_ADMIN_EMAILS }, role: 'admin' },
      { role: 'user' }
    );
    console.log('Removed admin role from all users except allowed emails');

    // Set admin role for allowed emails
    const result = await User.updateMany(
      { email: { $in: ALLOWED_ADMIN_EMAILS } },
      { role: 'admin' }
    );
    console.log(`Updated ${result.modifiedCount} users to admin role`);

    // Print all users with admin role
    const adminUsers = await User.find({ role: 'admin' });
    console.log('\nCurrent admin users:');
    adminUsers.forEach(user => {
      console.log(`- ${user.email} (${user.username})`);
    });

    console.log('\nAdmin update completed successfully');
  } catch (error) {
    console.error('Error updating admins:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the update
updateAdmins(); 