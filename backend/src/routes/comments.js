import express from 'express';
import { getUserComments } from '../controllers/userController.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Apply rate limiting to all routes
router.use(apiLimiter);

// Public routes
router.get('/user/:userId', getUserComments);

export default router;