import express from 'express';
import { register, login, getMe, updateDetails } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Apply rate limiting to all routes
router.use(apiLimiter);

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);

export default router; 