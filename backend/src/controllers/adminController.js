import User from '../models/User.js';
import Post from '../models/Post.js';
import mongoose from 'mongoose';

// @desc    Get all users with pagination
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    const query = {
      $or: [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    };

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// @desc    Ban/Unban user
// @route   PUT /api/admin/users/:id/ban
// @access  Private/Admin
export const toggleUserBan = async (req, res) => {
  try {
    const { isBanned, banReason, banExpiresAt } = req.body;
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    const updateData = {
      isBanned,
      banReason: isBanned ? banReason : '',
      banExpiresAt: isBanned ? banExpiresAt : null
    };

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Toggle user ban error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user ban status',
      error: error.message
    });
  }
};

// @desc    Get all posts with pagination
// @route   GET /api/admin/posts
// @access  Private/Admin
export const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const userId = req.query.userId;
    const skip = (page - 1) * limit;

    const query = {};
    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID format'
        });
      }
      query.userId = new mongoose.Types.ObjectId(userId);
    }

    const [posts, total] = await Promise.all([
      Post.find(query)
        .populate('userId', 'username avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Post.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: posts,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching posts',
      error: error.message
    });
  }
};

// @desc    Delete post
// @route   DELETE /api/admin/posts/:id
// @access  Private/Admin
export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID'
      });
    }

    const post = await Post.findByIdAndDelete(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting post',
      error: error.message
    });
  }
}; 