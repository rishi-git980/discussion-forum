import mongoose from 'mongoose';
import Category from '../models/Category.js';
import dotenv from 'dotenv';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const categories = [
  { name: 'General Discussion', slug: 'general-discussion' },
  { name: 'Programming', slug: 'programming' },
  { name: 'Technology', slug: 'technology' },
  { name: 'Gaming', slug: 'gaming' },
  { name: 'Science', slug: 'science' },
  { name: 'Arts & Culture', slug: 'arts-culture' },
  { name: 'Sports', slug: 'sports' },
  { name: 'Education', slug: 'education' },
  { name: 'Business', slug: 'business' },
  { name: 'Health & Wellness', slug: 'health-wellness' }
];

const seedCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete existing categories
    await Category.deleteMany({});
    console.log('Deleted existing categories');

    // Insert new categories
    await Category.insertMany(categories);
    console.log('Categories seeded successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
};

seedCategories(); 