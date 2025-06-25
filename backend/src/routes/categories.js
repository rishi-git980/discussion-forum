import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';

const router = express.Router();

router.route('/')
  .get(getCategories)
  .post(protect, createCategory);

// Route for getting a category by ID
router.get('/id/:id', getCategory);

// Route for getting a category by slug
router.get('/slug/:slug', getCategory);

// Protected routes for updating and deleting categories
router.route('/:id')
  .put(protect, updateCategory)
  .delete(protect, deleteCategory);

export default router; 