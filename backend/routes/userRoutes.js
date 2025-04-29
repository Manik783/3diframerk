const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  authUser,
  registerUser,
  getUserProfile,
  getAllUsers,
  getUserDetails
} = require('../controllers/userController');

// Public routes
router.post('/', registerUser);
router.post('/login', authUser);

// Protected routes
router.get('/profile', protect, getUserProfile);

// Admin routes
router.get('/all', protect, admin, getAllUsers);
router.get('/:id', protect, admin, getUserDetails);

module.exports = router; 