const Request = require('../models/Request');
const User = require('../models/User');
const Model = require('../models/Model');
const path = require('path');
const fs = require('fs');

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

// @desc    Get requests for logged in user
// @route   GET /api/requests/my
// @access  Private
const getUserRequests = async (req, res) => {
  try {
    console.log('Getting requests for user ID:', req.user._id);
    
    const requests = await Request.find({ user: req.user._id })
      .populate('model')
      .sort({ createdAt: -1 });
    
    console.log('Found', requests.length, 'requests for user');
    
    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Error in getUserRequests:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
};

// @desc    Get request by ID
// @route   GET /api/requests/:id
// @access  Private
const getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('user', 'name email')
      .populate('model');
    
    if (!request) {
      res.status(404);
      throw new Error('Request not found');
    }
    
    // Check if user is authorized to view this request
    if (request.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      res.status(401);
      throw new Error('Not authorized to view this request');
    }
    
    console.log('Request details:', {
      id: request._id,
      title: request.title,
      status: request.status,
      modelId: request.model ? (typeof request.model === 'object' ? request.model._id : request.model) : 'none'
    });
    
    res.json(request);
  } catch (error) {
    console.error('Error in getRequestById:', error);
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
};

// @desc    Get all requests (admin only)
// @route   GET /api/requests
// @access  Private/Admin
const getAllRequests = async (req, res) => {
  try {
    console.log('Received query params:', req.query);
    
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    
    const filter = {};
    
    if (req.query.status && req.query.status !== 'All') {
      filter.status = req.query.status;
    }
    
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Determine sort order
    const sortOrder = req.query.sort === 'asc' ? 1 : -1;
    console.log('Sort order:', sortOrder);
    
    const [requests, total] = await Promise.all([
      Request.find(filter)
        .populate('user', 'name email')
        .populate('model')
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(limit),
      Request.countDocuments(filter)
    ]);
    
    console.log(`Found ${requests.length} requests, sorted ${sortOrder === 1 ? 'ascending' : 'descending'}`);
    
    // Calculate statistics
    const stats = {
      total: await Request.countDocuments(),
      pending: await Request.countDocuments({ status: 'Pending' }),
      inProgress: await Request.countDocuments({ status: 'In Progress' }),
      completed: await Request.countDocuments({ status: 'Completed' }),
      rejected: await Request.countDocuments({ status: 'Rejected' })
    };
    
    res.json({
      success: true,
      data: {
        requests,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          current: page
        },
        stats
      }
    });
  } catch (error) {
    console.error('Error in getAllRequests:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
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

// @desc    Delete a request
// @route   DELETE /api/requests/:id
// @access  Private/Admin
const deleteRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Delete associated model files if they exist
    if (request.model) {
      const model = await Model.findById(request.model);
      if (model) {
        // Delete files from uploads directory
        if (model.glbFile) {
          const glbPath = path.join(__dirname, '..', model.glbFile);
          if (fs.existsSync(glbPath)) {
            fs.unlinkSync(glbPath);
          }
        }
        if (model.usdzFile) {
          const usdzPath = path.join(__dirname, '..', model.usdzFile);
          if (fs.existsSync(usdzPath)) {
            fs.unlinkSync(usdzPath);
          }
        }
        if (model.posterImage) {
          const posterPath = path.join(__dirname, '..', model.posterImage);
          if (fs.existsSync(posterPath)) {
            fs.unlinkSync(posterPath);
          }
        }
        // Delete the model document
        await Model.findByIdAndDelete(request.model);
      }
    }

    // Delete the request
    await request.deleteOne();
    
    res.json({ message: 'Request removed successfully' });
  } catch (error) {
    console.error('Error deleting request:', error);
    res.status(500).json({
      message: 'Server error during request deletion',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
};

module.exports = {
  createRequest,
  getUserRequests,
  getRequestById,
  getAllRequests,
  updateRequestStatus,
  deleteRequest
}; 