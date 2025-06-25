import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Please add content'],
    trim: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Please select a category'],
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  media: [{
    type: {
      type: String,
      enum: ['image', 'video'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    thumbnail: {
      type: String,
      required: function() {
        return this.type === 'video';
      }
    }
  }],
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  downvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  score: {
    type: Number,
    default: 0
  },
  comments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  strict: true,
  timestamps: true
});

// Create indexes
postSchema.index({ categoryId: 1, createdAt: -1 });
postSchema.index({ score: -1 }); // For sorting by score

// Calculate score when votes change
postSchema.pre('save', function(next) {
  if (this.isModified('upvotes') || this.isModified('downvotes')) {
    this.score = this.upvotes.length - this.downvotes.length;
  }
  next();
});

// Validate category exists
postSchema.pre('save', async function(next) {
  if (this.isModified('categoryId')) {
    const Category = mongoose.model('Category');
    const category = await Category.findById(this.categoryId);
    if (!category) {
      throw new Error('Invalid category ID');
    }
  }
  next();
});

export default mongoose.model('Post', postSchema); 