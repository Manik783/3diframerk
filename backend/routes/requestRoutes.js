const express = require('express');
const router = express.Router();
const { 
  createRequest,
  getUserRequests,
  getRequestById,
  getAllRequests,
  updateRequestStatus
} = require('../controllers/requestController');
const { protect, admin } = require('../middleware/authMiddleware');

// Create a new request (protected)
router.post('/', protect, createRequest);

// Get all requests for logged in user (protected)
router.get('/', protect, getUserRequests);

// Get all requests (admin only)
router.get('/all', protect, admin, getAllRequests);

// Get a single request by ID (protected)
router.get('/:id', protect, getRequestById);

// Update request status (admin only)
router.put('/:id/status', protect, admin, updateRequestStatus);

module.exports = router; 