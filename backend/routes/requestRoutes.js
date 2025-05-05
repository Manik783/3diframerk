const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  createRequest,
  getUserRequests,
  getAllRequests,
  getRequestById,
  updateRequestStatus,
  deleteRequest
} = require('../controllers/requestController');

// Public routes
router.post('/', protect, createRequest);
router.get('/my', protect, getUserRequests); // User's own requests

// Admin routes
// IMPORTANT: /all route must come BEFORE /:id to prevent "all" being treated as an ID
router.get('/all', protect, admin, getAllRequests); // All requests with filtering (admin only)
router.get('/:id', protect, getRequestById);
router.put('/:id/status', protect, admin, updateRequestStatus);
router.delete('/:id', protect, admin, deleteRequest);

module.exports = router;