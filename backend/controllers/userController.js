const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const Request = require('../models/Request');
const generateToken = require('../utils/generateToken');

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
    
    // Create user using the User model (will trigger password hashing middleware)
    const user = new User({
      name,
      email,
      password,
      isAdmin: false
    });
    
    // Save user (this will trigger the pre-save middleware)
    await user.save();
    
    console.log('User created successfully:', user._id);
    
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
const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);

    if (!email || !password) {
      console.log('Missing credentials:', { email: !!email, password: !!password });
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');
    console.log('User found:', user ? 'Yes' : 'No');

    if (!user) {
      console.log('Login failed: User not found');
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    console.log('Password match result:', isMatch);

    if (!isMatch) {
      console.log('Login failed: Password mismatch');
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Success response
    console.log('Login successful:', {
      userId: user._id,
      isAdmin: user.isAdmin
    });

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'production' ? null : error.message
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

// @desc    Get all users (admin only)
// @route   GET /api/users/all
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const { search, filter, sort } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filterObj = {};
    if (search) {
      filterObj.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Determine sort order
    const sortOrder = sort === 'asc' ? 1 : -1;

    // Aggregate pipeline to get users with request counts
    const aggregatePipeline = [
      { $match: filterObj },
      {
        $lookup: {
          from: 'requests',
          localField: '_id',
          foreignField: 'user',
          as: 'requests'
        }
      },
      {
        $addFields: {
          requestCount: { $size: '$requests' }
        }
      },
      {
        $project: {
          password: 0,
          requests: 0
        }
      }
    ];

    // Add filter based on request count if specified
    if (filter === 'with_requests') {
      aggregatePipeline.push({ $match: { requestCount: { $gt: 0 } } });
    } else if (filter === 'no_requests') {
      aggregatePipeline.push({ $match: { requestCount: 0 } });
    }

    // Add sorting and pagination
    aggregatePipeline.push(
      { $sort: { createdAt: sortOrder } },
      { $skip: skip },
      { $limit: limit }
    );

    const [users, total] = await Promise.all([
      User.aggregate(aggregatePipeline),
      User.countDocuments(filterObj)
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          current: page
        }
      }
    });
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
};

// @desc    Get user details by ID (admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's requests
    const requests = await Request.find({ user: user._id })
      .populate('model')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        user,
        requests
      }
    });
  } catch (error) {
    console.error('Error in getUserDetails:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
};

module.exports = {
  authUser,
  registerUser,
  getUserProfile,
  getAllUsers,
  getUserDetails
}; 