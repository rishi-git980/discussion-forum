import express from 'express';
import { protect } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';
import {
  getMe,
  updateUser,
  followUser,
  unfollowUser,
  getUserById,
  getUserFollowers,
  getUserFollowing
} from '../controllers/userController.js';

const router = express.Router();

// Apply rate limiting to all routes
router.use(apiLimiter);

// Public routes
router.get('/:id', getUserById);
router.get('/:id/followers', getUserFollowers);
router.get('/:id/following', getUserFollowing);

// Protected routes
router.get('/me', protect, getMe);
router.put('/:id', protect, updateUser);
router.post('/:userId/follow', protect, followUser);
router.post('/:userId/unfollow', protect, unfollowUser);

export default router;