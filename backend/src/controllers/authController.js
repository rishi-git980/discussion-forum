import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// List of allowed admin email addresses
const ALLOWED_ADMIN_EMAILS = [
  'varunrajsirimalla02@gmail.com',
  'rishinalike@gmail.com',
  'saikrishnareddygampala@gmail.com',
  'kallemakshitha2004@gmail.com'
];

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ 
        message: userExists.email === email ? 'Email already exists' : 'Username already exists' 
      });
    }

    // Determine role based on email
    const role = ALLOWED_ADMIN_EMAILS.includes(email) ? 'admin' : 'user';

    // Create user with determined role
    const user = await User.create({
      username,
      email,
      password,
      role
    });

    // Generate token
    const token = user.getSignedJwtToken();

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is banned
    if (user.isBanned) {
      let banMessage = 'Your account has been banned.';
      if (user.banReason) {
        banMessage += ` Reason: ${user.banReason}`;
      }
      if (user.banExpiresAt) {
        banMessage += ` Ban expires: ${new Date(user.banExpiresAt).toLocaleDateString()}`;
      }
      return res.status(403).json({ message: banMessage });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = user.getSignedJwtToken();

    res.json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        isBanned: user.isBanned,
        banReason: user.banReason,
        banExpiresAt: user.banExpiresAt
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Error getting user data' });
  }
};

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
export const updateDetails = async (req, res) => {
  try {
    console.log('Update details request:', req.body);
    const { username, email, avatar } = req.body;
    
    if (!req.user || !req.user._id) {
      console.error('No user found in request');
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized' 
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      console.error('User not found:', req.user._id);
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email already in use' 
        });
      }
    }

    // Check if username is already taken by another user
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'Username already in use' 
        });
      }
    }

    // Update user fields
    const updates = {};
    if (username) updates.username = username;
    if (email) updates.email = email;
    if (avatar) updates.avatar = avatar;

    console.log('Updating user with:', updates);

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      console.error('Failed to update user');
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update user' 
      });
    }

    console.log('User updated successfully:', updatedUser);

    res.json({
      success: true,
      data: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        avatar: updatedUser.avatar
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating user details',
      error: error.message 
    });
  }
}; 