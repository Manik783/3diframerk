const express = require('express');
const router = express.Router();
const { 
  registerUser,
  loginUser,
  getUserProfile
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Register a new user
router.post('/', registerUser);

// Login user
router.post('/login', loginUser);

// Get user profile (protected)
router.get('/profile', protect, getUserProfile);

module.exports = router; 