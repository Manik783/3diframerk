const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
  try {
    console.log('=== REGISTRATION ATTEMPT ===');
    const { name, email, password } = req.body;
    
    console.log('Registration for:', { name, email });
    
    // Check if user exists
    const userExists = await User.findOne({ email });
    
    console.log('User exists:', userExists ? 'Yes' : 'No');
    
    if (userExists) {
      console.log('Registration failed: Email already in use');
      res.status(400);
      throw new Error('User already exists');
    }
    
    // Create user
    console.log('Creating new user...');
    
    // Generate password hash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create the user with a direct database insert to bypass middleware
    const result = await User.collection.insertOne({
      name,
      email,
      password: hashedPassword,
      isAdmin: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Get the created user
    const user = await User.findById(result.insertedId);
    
    console.log('User created successfully:', user._id);
    console.log('Current users in database:');
    const allUsers = await User.find({});
    console.log(allUsers.map(u => ({ 
      id: u._id, 
      email: u.email, 
      name: u.name, 
      isAdmin: u.isAdmin 
    })));
    
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  console.log('Login attempt with email:', req.body.email);
  
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({
        message: 'Please provide email and password'
      });
    }
    
    // Find user
    const user = await User.findOne({ email });
    
    // For debugging, let's check the admin user in the database
    if (email === 'admin@example.com') {
      const adminUser = await User.findOne({ email: 'admin@example.com' });
      console.log('Admin user in DB:', adminUser ? {
        id: adminUser._id,
        email: adminUser.email,
        isAdmin: adminUser.isAdmin,
        passwordHash: adminUser.password.substring(0, 10) + '...',
      } : 'Not found');
    }
    
    // If user doesn't exist
    if (!user) {
      console.log(`Login failed: No user found with email ${email}`);
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }
    
    console.log(`User found: ${user.email}, isAdmin: ${user.isAdmin}, checking password...`);
    
    // For development, allow any password for testing
    if (process.env.NODE_ENV === 'development') {
      console.log('DEVELOPMENT MODE: Allowing login regardless of password');
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    }
    
    // Check password using both methods
    const isMatch = await bcrypt.compare(password, user.password);
    const isMatchAlt = await user.matchPassword(password);
    
    console.log('Password check results:', {
      bcryptCompare: isMatch,
      matchPassword: isMatchAlt
    });
    
    if (isMatch || isMatchAlt) {
      console.log(`Login successful for ${user.email}`);
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      console.log(`Login failed: Invalid password for ${email}`);
      res.status(401).json({
        message: 'Invalid credentials'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error.message
    });
  }
};

module.exports = {
  registerUser,
  loginUser: authUser,
  getUserProfile
}; 