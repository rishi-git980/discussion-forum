import mongoose from 'mongoose';
import Category from '../models/Category.js';
import dotenv from 'dotenv';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const updatedCategories = [
  {
    name: 'Technology',
    icon: '💻'
  },
  {
    name: 'Gaming',
    icon: '🎮'
  },
  {
    name: 'Movies',
    icon: '🎬'
  },
  {
    name: 'Music',
    icon: '🎵'
  },
  {
    name: 'Sports',
    icon: '⚽'
  }
];

const updateCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    for (const category of updatedCategories) {
      await Category.findOneAndUpdate(
        { name: category.name },
        { $set: { icon: category.icon } },
        { new: true }
      );
      console.log(`Updated ${category.name} with icon ${category.icon}`);
    }

    console.log('All categories updated successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error updating categories:', error);
    process.exit(1);
  }
};

updateCategories(); 