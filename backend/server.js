const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const morgan = require('morgan');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'https://frontend-seven-omega-33.vercel.app',
  'https://shopxar-frontend.onrender.com',
  'https://shopxar-backend.onrender.com'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Use CORS middleware
app.use(cors(corsOptions));

// Handle Preflight requests properly
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  console.log('Creating uploads directory:', uploadsDir);
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create temp directory if it doesn't exist
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  console.log('Creating temp directory:', tempDir);
  fs.mkdirSync(tempDir, { recursive: true });
}

// Serve uploads directory for 3D model files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
console.log('Uploads directory path:', path.join(__dirname, 'uploads'));

// Import routes
const userRoutes = require('./routes/userRoutes');
const requestRoutes = require('./routes/requestRoutes');
const modelRoutes = require('./routes/modelRoutes');
const embedRoutes = require('./routes/embedRoutes');

// API routes
app.use('/api/users', userRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/models', modelRoutes);
app.use('/embed', embedRoutes); // Note: no /api prefix for embed routes

// Serve uploads directory for local file storage fallback
const setupUploadsDirectory = () => {
  const uploadDir = process.env.UPLOAD_DIR || 'backend/uploads';
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`Created uploads directory: ${uploadDir}`);
  }
  return uploadDir;
};

app.use('/api/uploads', express.static(setupUploadsDirectory()));

// Create a simple default route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to ShopXAR API',
    documentation: '/api-docs',
    status: 'running'
  });
});

// Additional /embed/:modelId route for direct model embedding
app.get('/embed/:modelId', async (req, res) => {
  try {
    const { modelId } = req.params;
    
    console.log(`Direct model embedding request for model: ${modelId}`);
    
    // Get model from database
    const Model = require('./models/Model');
    const model = await Model.findById(modelId);
    
    if (!model) {
      console.error(`Model not found with ID: ${modelId}`);
      return res.status(404).send('Model not found');
    }
    
    // Generate and send HTML with model-viewer
    const modelUrl = model.glbFile;
    const usdzUrl = model.usdzFile;
    const posterUrl = model.posterImage;
    
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('X-Frame-Options', 'ALLOWALL'); // Allow embedding in iframes
    
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>3D Model Viewer</title>
        <script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>
        <style>
          body, html { margin: 0; height: 100%; }
          model-viewer { width: 100%; height: 100vh; }
        </style>
      </head>
      <body>
        <model-viewer 
          src="${modelUrl}" 
          ${usdzUrl ? `ios-src="${usdzUrl}"` : ''}
          ${posterUrl ? `poster="${posterUrl}"` : ''}
          alt="3D model" 
          auto-rotate 
          camera-controls
          ar
          ar-modes="webxr scene-viewer quick-look"
          shadow-intensity="1">
        </model-viewer>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Error serving embed HTML:', error);
    res.status(500).send('Error loading model viewer');
  }
});

// Development route to see all users 
if (process.env.NODE_ENV !== 'production') {
  app.get('/dev/users', async (req, res) => {
    try {
      const User = require('./models/User');
      const users = await User.find({});
      res.json({
        count: users.length,
        users: users.map(u => ({
          id: u._id,
          name: u.name,
          email: u.email,
          isAdmin: u.isAdmin,
          passwordLength: u.password?.length || 0
        }))
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
}

// Connect to MongoDB database
const startServer = async () => {
  try {
    // Connect to MongoDB using the URI from .env
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/3dmodels';
    
    console.log('Attempting to connect to MongoDB with URI:', mongoUri);
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected successfully');
    
    // Enable mongoose debugging in development
    if (process.env.NODE_ENV === 'development') {
      mongoose.set('debug', true);
    }
    
    // Create an admin user for testing if it doesn't exist
    const User = require('./models/User');
    
    // Create fixed password hashes to ensure consistency
    const adminPassword = '$2a$10$JwSJBqD.WfPiJfW4QZF.3eMsGlQwAZKcmvkxrHCwKYjLlXwGgC49y'; // password123
    const userPassword = '$2a$10$JwSJBqD.WfPiJfW4QZF.3eMsGlQwAZKcmvkxrHCwKYjLlXwGgC49y'; // password123
    
    // Create admin user (directly with hashed password to bypass hashing)
    try {
      const adminExists = await User.findOne({ email: 'admin@example.com' });
      console.log('Admin user exists:', adminExists ? 'Yes' : 'No');
      
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
        console.log('Admin user created successfully');
      }
    } catch (error) {
      console.error('Error creating admin user:', error);
    }
    
    // Serve frontend in production
    if (process.env.NODE_ENV === 'production') {
      app.use(express.static(path.join(__dirname, '../frontend/build')));
      
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'));
      });
    }
    
    // Error handling middleware
    app.use(notFound);
    app.use(errorHandler);
    
    // Start the server
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      console.log('API URL:', `http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

startServer(); 
