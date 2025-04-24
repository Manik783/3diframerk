const Request = require('../models/Request');

// @desc    Create a new 3D model request
// @route   POST /api/requests
// @access  Private
const createRequest = async (req, res) => {
  try {
    const { title, description, specifications, additionalNotes } = req.body;
    
    const request = await Request.create({
      user: req.user._id,
      title,
      description,
      specifications,
      additionalNotes
    });
    
    if (request) {
      res.status(201).json(request);
    } else {
      res.status(400);
      throw new Error('Invalid request data');
    }
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error.message
    });
  }
};

// @desc    Get all requests for logged in user
// @route   GET /api/requests
// @access  Private
const getUserRequests = async (req, res) => {
  try {
    const requests = await Request.find({ user: req.user._id })
      .populate('model')
      .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single request by ID
// @route   GET /api/requests/:id
// @access  Private
const getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('model');
    
    // Check if request exists
    if (!request) {
      res.status(404);
      throw new Error('Request not found');
    }
    
    // Check if request belongs to logged in user or is admin
    if (request.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      res.status(401);
      throw new Error('Not authorized to access this request');
    }
    
    res.json(request);
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error.message
    });
  }
};

// @desc    Get all requests (admin only)
// @route   GET /api/requests/all
// @access  Private/Admin
const getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find({})
      .populate('user', 'name email')
      .populate('model')
      .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update request status
// @route   PUT /api/requests/:id/status
// @access  Private/Admin
const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const request = await Request.findById(req.params.id);
    
    if (!request) {
      res.status(404);
      throw new Error('Request not found');
    }
    
    request.status = status;
    const updatedRequest = await request.save();
    
    res.json(updatedRequest);
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error.message
    });
  }
};

module.exports = {
  createRequest,
  getUserRequests,
  getRequestById,
  getAllRequests,
  updateRequestStatus
}; 