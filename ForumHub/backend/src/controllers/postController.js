import Post from '../models/Post.js';
import Category from '../models/Category.js';
import mongoose from 'mongoose';
import fs from 'fs';

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
export const getPosts = async (req, res) => {
  try {
    let query = {};
    
    // Filter by category
    if (req.query.category) {
      console.log('Category ID from request:', req.query.category); // Debug log
      
      if (!mongoose.Types.ObjectId.isValid(req.query.category)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category ID format'
        });
      }

      // Convert string ID to ObjectId
      const categoryId = new mongoose.Types.ObjectId(req.query.category);
      console.log('Converted category ObjectId:', categoryId.toString()); // Debug log

      // Find the category
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      console.log('Found category:', {
        id: category._id.toString(),
        name: category.name
      }); // Debug log
      
      // Set the query to match exact category ID
      query.categoryId = categoryId;

      // Log all posts with this category
      const postsWithCategory = await Post.find({ categoryId })
        .select('_id title categoryId')
        .lean();
      
      console.log('Posts with this category:', postsWithCategory.map(p => ({
        id: p._id.toString(),
        title: p.title,
        categoryId: p.categoryId.toString()
      })));
    }
    
    // Search in title and content
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { content: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Sort options
    let sortOption = { createdAt: -1 }; // Default sort by newest
    if (req.query.sort === 'trending') {
      // For trending, combine recent posts (last week) with high engagement
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      query.createdAt = { $gte: oneWeekAgo };
      sortOption = { 
        score: -1, // First sort by score (upvotes - downvotes)
        likes: -1, // Then by number of likes
        createdAt: -1 // Finally by creation date
      };
    }

    console.log('Final query:', JSON.stringify(query, null, 2)); // Debug log
    console.log('Sort option:', sortOption); // Debug log

    const posts = await Post.find(query)
      .sort(sortOption)
      .populate('userId', 'username avatar')
      .populate('categoryId', 'name slug');

    // Log the found posts with their categories
    console.log('Found posts:', posts.length); // Debug log
    console.log('Posts details:', posts.map(post => ({
      id: post._id.toString(),
      title: post.title,
      categoryId: post.categoryId ? post.categoryId._id.toString() : null,
      categoryName: post.categoryId ? post.categoryId.name : null
    })));

    res.status(200).json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('Error in getPosts:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public
export const getPost = async (req, res) => {
  try {
    console.log('Getting post with ID:', req.params.id);
    
    if (!req.params.id) {
      console.log('No post ID provided');
      return res.status(400).json({
        success: false,
        message: 'Post ID is required'
      });
    }

    const post = await Post.findById(req.params.id)
      .populate('userId', 'username avatar')
      .populate('categoryId', 'name slug')
      .populate('comments.userId', 'username avatar');

    console.log('Found post:', post ? 'yes' : 'no');

    if (!post) {
      console.log('Post not found with ID:', req.params.id);
      return res.status(404).json({ 
        success: false,
        message: 'Post not found' 
      });
    }

    console.log('Sending post data');
    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Get post error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      success: false,
      message: 'Error fetching post',
      error: error.message
    });
  }
};

// @desc    Create new post
// @route   POST /api/posts
// @access  Private
export const createPost = async (req, res) => {
  try {
    const { title, content, categoryId } = req.body;
    const mediaFiles = req.files || [];

    console.log('Creating post with data:', {
      title,
      content,
      categoryId,
      mediaFilesCount: mediaFiles.length,
      mediaFiles: mediaFiles.map(file => ({
        filename: file.filename,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size
      }))
    });

    // Validate required fields
    if (!title || !content || !categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, content, and category'
      });
    }

    // Validate category ID format
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID format'
      });
    }

    // Convert to ObjectId and verify category exists
    const categoryObjectId = new mongoose.Types.ObjectId(categoryId);
    const category = await Category.findById(categoryObjectId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Process media files
    const media = [];
    for (const file of mediaFiles) {
      console.log('Processing media file:', {
        filename: file.filename,
        mimetype: file.mimetype,
        path: file.path,
        size: file.size
      });

      // Verify file exists
      if (!fs.existsSync(file.path)) {
        console.error('File not found:', file.path);
        continue;
      }

      const fileType = file.mimetype.startsWith('image/') ? 'image' : 'video';
      const fileUrl = `/uploads/posts/${file.filename}`;
      
      media.push({
        type: fileType,
        url: fileUrl,
        thumbnail: fileType === 'video' ? `/uploads/posts/thumbnails/${file.filename}` : null
      });
    }

    console.log('Processed media:', media);

    // Create post with user ID from auth middleware
    const post = await Post.create({
      title,
      content,
      categoryId: categoryObjectId,
      userId: req.user._id,
      media
    });

    console.log('Created post:', {
      id: post._id,
      title: post.title,
      mediaCount: post.media.length,
      media: post.media
    });

    // Populate the post with user and category data
    const populatedPost = await Post.findById(post._id)
      .populate('userId', 'username avatar')
      .populate('categoryId', 'name slug');

    res.status(201).json({
      success: true,
      data: populatedPost
    });
  } catch (error) {
    console.error('Error in createPost:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
export const updatePost = async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Make sure user is post owner
    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this post' });
    }

    post = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('userId', 'username avatar');

    res.json(post);
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ message: 'Error updating post' });
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
export const deletePost = async (req, res) => {
  try {
    console.log('Delete post request:', {
      postId: req.params.id,
      userId: req.user._id
    });

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('Invalid post ID format:', req.params.id);
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID format'
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      console.log('Post not found:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    console.log('Found post:', {
      postId: post._id,
      postUserId: post.userId.toString(),
      currentUserId: req.user._id.toString(),
      isOwner: post.userId.toString() === req.user._id.toString()
    });

    // Only allow post owner to delete
    if (post.userId.toString() !== req.user._id.toString()) {
      console.log('Unauthorized delete attempt:', {
        postUserId: post.userId.toString(),
        currentUserId: req.user._id.toString()
      });
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    const result = await Post.findByIdAndDelete(req.params.id);
    console.log('Delete result:', result);

    if (!result) {
      console.log('Post deletion failed - no result');
      return res.status(500).json({
        success: false,
        message: 'Failed to delete post'
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

// @desc    Add comment to post
// @route   POST /api/posts/:id/comments
// @access  Private
export const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const newComment = {
      content,
      userId: req.user._id,
      createdAt: Date.now()
    };

    post.comments.unshift(newComment);

    // Increment the comment count
    post.commentCount = (post.commentCount || 0) + 1;

    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate('userId', 'username avatar')
      .populate('comments.userId', 'username avatar');

    // Emit socket event for real-time updates
    req.app.get('io')?.emit('commentAdded', {
      postId: post._id,
      comment: populatedPost.comments[0]
    });

    res.json(populatedPost);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Error adding comment' });
  }
};

// @desc    Vote on post (upvote or downvote)
// @route   PUT /api/posts/:id/vote
// @access  Private
export const votePost = async (req, res) => {
  try {
    const { voteType } = req.body; // 'up' or 'down'
    
    if (!['up', 'down'].includes(voteType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vote type'
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const userId = req.user._id;
    const hasUpvoted = post.upvotes.includes(userId);
    const hasDownvoted = post.downvotes.includes(userId);

    // Remove any existing votes
    post.upvotes = post.upvotes.filter(id => !id.equals(userId));
    post.downvotes = post.downvotes.filter(id => !id.equals(userId));

    // Add new vote only if it's different from the previous one
    if (voteType === 'up') {
      if (!hasUpvoted) {
        post.upvotes.push(userId);
      }
    } else if (voteType === 'down') {
      if (!hasDownvoted) {
        post.downvotes.push(userId);
      }
    }

    // Calculate score
    post.score = post.upvotes.length - post.downvotes.length;

    await post.save();

    // Fetch updated post with populated fields
    const updatedPost = await Post.findById(post._id)
      .populate('userId', 'username avatar')
      .populate('categoryId', 'name slug')
      .populate('comments.userId', 'username avatar');

    res.json(updatedPost);
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({
      success: false,
      message: 'Error voting on post',
      error: error.message
    });
  }
};

// @desc    Get user's posts
// @route   GET /api/posts/user/:userId
// @access  Public
export const getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .populate('userId', 'username avatar')
      .populate('categoryId', 'name slug')
      .populate('comments.userId', 'username avatar');

    res.json(posts);
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ message: 'Error fetching user posts' });
  }
};

// @desc    Delete comment from post
// @route   DELETE /api/posts/:id/comments/:commentId
// @access  Private
export const deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Find the comment
    const comment = post.comments.find(
      comment => comment._id.toString() === req.params.commentId
    );

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Make sure user is comment owner
    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }

    // Remove comment
    post.comments = post.comments.filter(
      comment => comment._id.toString() !== req.params.commentId
    );

    // Decrement the comment count
    post.commentCount = Math.max(0, (post.commentCount || 0) - 1);

    await post.save();

    // Return updated post with populated fields
    const updatedPost = await Post.findById(post._id)
      .populate('userId', 'username avatar')
      .populate('categoryId', 'name slug')
      .populate('comments.userId', 'username avatar');

    // Emit socket event for real-time updates
    req.app.get('io').emit('commentDeleted', {
      postId: post._id,
      commentId: req.params.commentId
    });

    res.json({
      success: true,
      data: updatedPost
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting comment',
      error: error.message
    });
  }
};

// @desc    Toggle like on post
// @route   PUT /api/posts/:id/like
// @access  Private
export const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const userId = req.user._id;
    const hasLiked = post.likes?.includes(userId);

    // Toggle like
    if (hasLiked) {
      post.likes = post.likes.filter(id => !id.equals(userId));
    } else {
      if (!post.likes) {
        post.likes = [];
      }
      post.likes.push(userId);
    }

    await post.save();

    // Fetch updated post with populated fields
    const updatedPost = await Post.findById(post._id)
      .populate('userId', 'username avatar')
      .populate('categoryId', 'name slug')
      .populate('comments.userId', 'username avatar');

    res.json({
      success: true,
      data: updatedPost
    });
  } catch (error) {
    console.error('Like error:', error);
    res.status(500).json({
      success: false,
      message: 'Error liking post',
      error: error.message
    });
  }
};

// @desc    Get user's liked posts
// @route   GET /api/posts/liked/:userId
// @access  Public
export const getLikedPosts = async (req, res) => {
  try {
    const posts = await Post.find({ 
      likes: req.params.userId 
    })
    .sort({ createdAt: -1 })
    .populate('userId', 'username avatar')
    .populate('categoryId', 'name slug')
    .populate('comments.userId', 'username avatar');

    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('Get liked posts error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching liked posts',
      error: error.message 
    });
  }
};