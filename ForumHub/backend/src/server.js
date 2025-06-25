import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'JWT_EXPIRE', 'CORS_ORIGIN'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Error: ${envVar} is not set in environment variables`);
    process.exit(1);
  }
}

console.log(`CORS_ORIGIN from .env: ${process.env.CORS_ORIGIN}`);

const PORT = process.env.PORT || 5000;
const MAX_PORT_ATTEMPTS = 10;

// Function to find an available port
const findAvailablePort = async (startPort) => {
  for (let port = startPort; port < startPort + MAX_PORT_ATTEMPTS; port++) {
    try {
      const server = createServer();
      await new Promise((resolve, reject) => {
        server.once('error', (err) => {
          if (err.code === 'EADDRINUSE') {
            resolve(false);
          } else {
            reject(err);
          }
        });
        server.once('listening', () => {
          server.close();
          resolve(true);
        });
        server.listen(port);
      });
      return port;
    } catch (err) {
      console.error(`Error checking port ${port}:`, err);
    }
  }
  throw new Error('No available ports found');
};

// Connect to database
try {
  await connectDB();
} catch (error) {
  console.error('Failed to connect to database:', error);
  process.exit(1);
}

const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Add CORS preflight handler
app.options('*', cors(corsOptions));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Routes
import authRoutes from './routes/auth.js';
import postRoutes from './routes/posts.js';
import categoryRoutes from './routes/categories.js';
import userRoutes from './routes/users.js';
import commentRoutes from './routes/comments.js';
import avatarRoutes from './routes/avatarRoutes.js';
import adminRoutes from './routes/admin.js';

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/avatar', avatarRoutes);
app.use('/api/admin', adminRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Create HTTP server
const httpServer = createServer(app);

// Create Socket.IO server
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
const startServer = async () => {
  try {
    const availablePort = await findAvailablePort(PORT);
    httpServer.listen(availablePort, () => {
      console.log(`Server running on port ${availablePort}`);
      console.log(`CORS enabled for origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  httpServer.close(() => {
    console.log('Server closed due to unhandled promise rejection');
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  httpServer.close(() => {
    console.log('Server closed due to uncaught exception');
    process.exit(1);
  });
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  httpServer.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  httpServer.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
}); 