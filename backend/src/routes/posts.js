import express from 'express';
import { protect } from '../middleware/auth.js';
import { apiLimiter, createPostLimiter } from '../middleware/rateLimiter.js';
import {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  getUserPosts,
  votePost,
  addComment,
  deleteComment,
  toggleLike,
  getLikedPosts
} from '../controllers/postController.js';
import { upload, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

// Apply rate limiting to all routes
router.use(apiLimiter);

// Public routes
router.get('/', getPosts);
router.get('/user/:userId', getUserPosts);
router.get('/liked/:userId', getLikedPosts);
router.get('/:id', getPost);

// Protected routes
router.post('/', 
  protect, 
  createPostLimiter, 
  (req, res, next) => {
    console.log('Upload middleware - Request body:', req.body);
    console.log('Upload middleware - Request files:', req.files);
    upload(req, res, (err) => {
      if (err) {
        console.error('Upload error:', err);
        return handleUploadError(err, req, res, next);
      }
      console.log('Files after upload:', req.files);
      next();
    });
  },
  createPost
);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.put('/:id/vote', protect, votePost);
router.put('/:id/like', protect, toggleLike);
router.post('/:id/comments', protect, addComment);
router.delete('/:id/comments/:commentId', protect, deleteComment);

export default router;