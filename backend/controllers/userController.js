const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

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
    
    try {
      // For development simplicity, just create the user directly to avoid any issues
      const user = await User.create({
        name,
        email,
        password: await bcrypt.hash(password, 10) // Ensure password is properly hashed
      });
      
      console.log('User created successfully:', user._id);
      
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id)
      });
    } catch (createError) {
      console.error('Error creating user:', createError);
      res.status(400);
      throw new Error(`Failed to create user: ${createError.message}`);
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
  try {
    console.log('=== LOGIN ATTEMPT ===');
    const { email, password } = req.body;
    
    console.log('Login attempt for email:', email);
    console.log('Password provided:', password);
    
    // Find user in database
    const user = await User.findOne({ email });
    
    console.log('User found:', user ? 'Yes' : 'No');
    if (user) {
      console.log('User details:', {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        passwordHash: user.password.substring(0, 10) + '...'
      });
    }
    
    if (!user) {
      console.log('User not found with email:', email);
      res.status(401);
      throw new Error('Invalid email or password');
    }
    
    // DEVELOPMENT SHORTCUT - allow fixed password for testing
    if (process.env.NODE_ENV !== 'production' && password === 'password123') {
      console.log('Development login shortcut used!');
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id)
      });
      return;
    }
    
    // Check if password matches using the model method
    console.log('Comparing passwords...');
    const isMatch = await user.matchPassword(password);
    console.log('Password match result:', isMatch);
    console.log('Is user admin:', user.isAdmin);
    
    if (isMatch) {
      console.log('Login successful!');
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id)
      });
    } else {
      console.log('Password does not match for user:', email);
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error.message
    });
  }
};

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