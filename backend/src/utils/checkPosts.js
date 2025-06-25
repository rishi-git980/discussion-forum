import mongoose from 'mongoose';
import Post from '../models/Post.js';
import Category from '../models/Category.js';
import dotenv from 'dotenv';

dotenv.config();

const checkAndFixPosts = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get all categories
    const categories = await Category.find({});
    console.log(`Found ${categories.length} categories`);
    console.log('Categories:', categories.map(cat => ({
      id: cat._id.toString(),
      name: cat.name
    })));

    // Get all posts
    const posts = await Post.find({}).populate('categoryId');
    console.log(`\nFound ${posts.length} posts`);
    
    let needsFix = false;
    for (const post of posts) {
      console.log(`\nChecking post ${post._id}:`);
      console.log('Title:', post.title);
      console.log('Category ID:', post.categoryId ? post.categoryId._id.toString() : 'null');
      console.log('Category Name:', post.categoryId ? post.categoryId.name : 'null');
      
      if (!post.categoryId || !mongoose.Types.ObjectId.isValid(post.categoryId)) {
        console.log('Post has invalid category!');
        needsFix = true;
        
        // Assign to first category as fallback
        if (categories.length > 0) {
          post.categoryId = categories[0]._id;
          await post.save();
          console.log('Fixed: Assigned to category:', categories[0].name);
        }
      }
    }

    if (!needsFix) {
      console.log('\nAll posts have valid categories!');
    }

    console.log('\nDone!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkAndFixPosts(); 