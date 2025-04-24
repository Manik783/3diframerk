const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'https://frontend-l1x8iuqsj-lakshay-chetals-projects.vercel.app', 'https://3d-iframe.vercel.app'] 
    : 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads directory for 3D model files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve root index.html for testing if nothing else works
app.use('/test', express.static(path.join(__dirname, '..')));

// Import routes
const userRoutes = require('./routes/userRoutes');
const requestRoutes = require('./routes/requestRoutes');
const modelRoutes = require('./routes/modelRoutes');

// API routes
app.use('/api/users', userRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/models', modelRoutes);

// Connect to MongoDB Atlas for production or In-Memory MongoDB for development
const startServer = async () => {
  try {
    // Use MongoDB Atlas in production or with MONGODB_URI, otherwise use in-memory MongoDB
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB Atlas connected');
    } else {
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log('MongoDB In-Memory connected (development)');
    }
    
    // Enable mongoose debugging
    mongoose.set('debug', process.env.NODE_ENV !== 'production');
    
    // Create an admin user for testing
    const User = require('./models/User');
    
    // Create fixed password hashes to ensure consistency
    const adminPassword = '$2a$10$JwSJBqD.WfPiJfW4QZF.3eMsGlQwAZKcmvkxrHCwKYjLlXwGgC49y'; // password123
    const userPassword = '$2a$10$JwSJBqD.WfPiJfW4QZF.3eMsGlQwAZKcmvkxrHCwKYjLlXwGgC49y'; // password123
    
    // Create admin user (directly with hashed password to bypass hashing)
    try {
      const adminExists = await User.findOne({ email: 'admin@example.com' });
      if (!adminExists) {
        // Create admin directly in the database
        await User.collection.insertOne({
          name: 'Admin User',
          email: 'admin@example.com',
          password: adminPassword,
          isAdmin: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log('Admin user created with hardcoded password');
      }
      
      // Create test user
      const testUserExists = await User.findOne({ email: 'user@example.com' });
      if (!testUserExists) {
        // Create test user directly in the database
        await User.collection.insertOne({
          name: 'Test User',
          email: 'user@example.com',
          password: userPassword,
          isAdmin: false,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log('Test user created with hardcoded password');
      }
      
      console.log('User credentials:');
      console.log('Admin: admin@example.com / password123');
      console.log('User: user@example.com / password123');
    } catch (err) {
      console.error('Error creating users:', err);
    }
    
    // Serve frontend in production
    if (process.env.NODE_ENV === 'production') {
      // First try to serve from frontend/build
      app.use(express.static(path.join(__dirname, '../frontend/build')));
      
      // Also serve the root index.html as a fallback
      app.get('/', (req, res) => {
        const rootIndexPath = path.join(__dirname, '../index.html');
        if (require('fs').existsSync(rootIndexPath)) {
          res.sendFile(rootIndexPath);
        } else {
          res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'));
        }
      });
      
      // Serve frontend routes
      app.get('*', (req, res) => {
        // Skip API routes
        if (req.path.startsWith('/api/')) return;
        
        // Try to send the frontend build index
        res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'));
      });
    }
    
    // Error handling middleware
    app.use(notFound);
    app.use(errorHandler);
    
    // Start server
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
  }
};

startServer(); 