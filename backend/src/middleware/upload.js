import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directories exist
const uploadDir = path.join(process.cwd(), 'uploads', 'posts');
const thumbnailDir = path.join(process.cwd(), 'uploads', 'posts', 'thumbnails');

console.log('Upload directory:', uploadDir);
console.log('Thumbnail directory:', thumbnailDir);

// Create directories if they don't exist
try {
  if (!fs.existsSync(uploadDir)) {
    console.log('Creating upload directory...');
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  if (!fs.existsSync(thumbnailDir)) {
    console.log('Creating thumbnail directory...');
    fs.mkdirSync(thumbnailDir, { recursive: true });
  }
} catch (error) {
  console.error('Error creating directories:', error);
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('File being uploaded:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = uniqueSuffix + path.extname(file.originalname);
    console.log('Generated filename:', filename);
    cb(null, filename);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  console.log('Checking file type:', file.mimetype);
  // Accept images and videos
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    console.log('File type rejected:', file.mimetype);
    cb(new Error('Only images and videos are allowed!'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 5 // Maximum 5 files
  }
}).array('media', 5); // Use array() instead of array() in the route

// Add error handling middleware
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('Multer error:', err);
    return res.status(400).json({
      success: false,
      message: err.message
    });
  } else if (err) {
    console.error('Upload error:', err);
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next();
};

export { upload, handleUploadError }; 