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
router.get('/', protect, admin, getAllRequests); // All requests with filtering
router.get('/:id', protect, getRequestById);
router.put('/:id/status', protect, admin, updateRequestStatus);
router.delete('/:id', protect, admin, deleteRequest);

module.exports = router;