import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import {
  getAllUsers,
  toggleUserBan,
  getAllPosts,
  deletePost
} from '../controllers/adminController.js';

const router = express.Router();

// Protect all admin routes
router.use(protect);
router.use(admin);

// User management routes
router.get('/users', getAllUsers);
router.put('/users/:id/ban', toggleUserBan);

// Post management routes
router.get('/posts', getAllPosts);
router.delete('/posts/:id', deletePost);

export default router; 