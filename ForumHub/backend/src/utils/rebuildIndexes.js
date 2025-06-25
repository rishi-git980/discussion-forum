import mongoose from 'mongoose';
import Post from '../models/Post.js';
import dotenv from 'dotenv';

dotenv.config();

const rebuildIndexes = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    console.log('Dropping existing indexes on Post collection...');
    await Post.collection.dropIndexes();
    console.log('Dropped existing indexes');

    console.log('Creating new indexes...');
    await Post.syncIndexes();
    console.log('Created new indexes');

    console.log('Verifying posts have valid categories...');
    const posts = await Post.find({}).select('_id categoryId');
    console.log(`Found ${posts.length} posts`);

    for (const post of posts) {
      console.log(`Checking post ${post._id}...`);
      if (!post.categoryId) {
        console.log(`Post ${post._id} has no category!`);
      }
    }

    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

rebuildIndexes(); 