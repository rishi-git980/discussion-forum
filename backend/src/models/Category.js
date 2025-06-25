import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a category name'],
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    trim: true,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  icon: {
    type: String,
    default: 'folder' // Default icon name
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create slug from name before saving
categorySchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-');
  }
  next();
});

// Create slugs for bulk insert
categorySchema.pre('insertMany', function(next, docs) {
  docs.forEach(doc => {
    if (!doc.slug) {
      doc.slug = doc.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-');
    }
  });
  next();
});

const Category = mongoose.model('Category', categorySchema);
export default Category; 