const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  
  // Check if token exists in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from token (exclude password)
      req.user = await User.findById(decoded.id).select('-password');
      
      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }
  
  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
};

const admin = (req, res, next) => {
  console.log('Admin middleware check');
  console.log('User:', req.user ? req.user.email : 'No user');
  console.log('Is admin?', req.user ? req.user.isAdmin : false);
  
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as admin');
  }
};

module.exports = { protect, admin }; 