// This is a server file to handle both static content and API requests
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Log all environment variables for debugging
console.log('=== ENVIRONMENT VARIABLES ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET (hidden for security)' : 'NOT SET');
console.log('===========================');

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= STATIC FILE SERVING =================
// Serve static files from frontend/build if it exists
const frontendBuildPath = path.join(__dirname, 'frontend', 'build');
if (fs.existsSync(frontendBuildPath)) {
  console.log('Serving frontend from:', frontendBuildPath);
  app.use(express.static(frontendBuildPath));
}

// Serve static files from root directory for test pages
app.use(express.static(path.join(__dirname)));

// Serve uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'backend', 'uploads')));

// ================= API ROUTES =================
// Optional: Import and use backend routes if they're available
try {
  const userRoutes = require('./backend/routes/userRoutes');
  const requestRoutes = require('./backend/routes/requestRoutes');
  const modelRoutes = require('./backend/routes/modelRoutes');
  
  app.use('/api/users', userRoutes);
  app.use('/api/requests', requestRoutes);
  app.use('/api/models', modelRoutes);
  
  console.log('API routes loaded successfully');
} catch (error) {
  console.error('Error loading API routes:', error.message);
  
  // Fallback API endpoint for testing
  app.get('/api/users', (req, res) => {
    res.status(200).json({ message: 'API is working, but routes are not fully loaded' });
  });
}

// ================= CONNECT TO DATABASE =================
// Connect to MongoDB if URI is provided
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('MongoDB connected successfully');
      
      // Create admin user for testing if not exists
      const User = require('./backend/models/User');
      const bcrypt = require('bcryptjs');
      
      // Create admin user
      User.findOne({ email: 'admin@example.com' })
        .then(adminExists => {
          if (!adminExists) {
            const newAdmin = new User({
              name: 'Admin User',
              email: 'admin@example.com',
              password: bcrypt.hashSync('password123', 10),
              isAdmin: true
            });
            return newAdmin.save();
          }
          return adminExists;
        })
        .then(admin => {
          console.log('Admin user available');
        })
        .catch(err => console.error('Error creating admin user:', err));
    })
    .catch(error => {
      console.error('MongoDB connection error:', error.message);
    });
} else {
  console.log('No MongoDB URI provided - database features will be unavailable');
}

// ================= CATCHALL ROUTE =================
// For React's client-side routing, send the main index.html for any unknown routes
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) return;
  
  // Try to serve from frontend/build
  if (fs.existsSync(path.join(frontendBuildPath, 'index.html'))) {
    return res.sendFile(path.join(frontendBuildPath, 'index.html'));
  }
  
  // Fallback to root index.html
  if (fs.existsSync(path.join(__dirname, 'index.html'))) {
    return res.sendFile(path.join(__dirname, 'index.html'));
  }
  
  // Last resort - send a plain text response
  res.send('Application is running, but no index.html file found');
});

// ================= START SERVER =================
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend URL: ${process.env.BASE_URL || 'http://localhost:' + PORT}`);
}); 