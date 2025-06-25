import mongoose from 'mongoose';
import Category from '../models/Category.js';

const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Check if categories exist
    const existingCategories = await Category.countDocuments();
    
    if (existingCategories === 0) {
      console.log('No categories found. Creating default categories...');
      
      // Default categories with slugs
      const defaultCategories = [
        {
          name: 'Technology',
          slug: 'technology',
          description: 'Discussions about technology, programming, and software development',
          icon: '💻'
        },
        {
          name: 'Gaming',
          slug: 'gaming',
          description: 'Video games, gaming news, and gaming culture',
          icon: '🎮'
        },
        {
          name: 'Movies',
          slug: 'movies',
          description: 'Film discussions, reviews, and news',
          icon: '🎬'
        },
        {
          name: 'Music',
          slug: 'music',
          description: 'Music discussions, recommendations, and news',
          icon: '🎧'
        },
        {
          name: 'Sports',
          slug: 'sports',
          description: 'Sports news, discussions, and events',
          icon: '⚽'
        }
      ];

      try {
        console.log('Inserting default categories...');
        const result = await Category.insertMany(defaultCategories);
        console.log('Default categories created successfully:', result.map(cat => ({
          id: cat._id,
          name: cat.name,
          slug: cat.slug
        })));
      } catch (error) {
        console.error('Error creating default categories:', error);
        console.error('Error stack:', error.stack);
      }
    } else {
      console.log(`Found ${existingCategories} existing categories. Skipping default category creation.`);
    }
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    console.error('Error stack:', error.stack);
    process.exit(1);
  }
};

export default connectDB; 