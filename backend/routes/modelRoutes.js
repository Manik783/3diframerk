const express = require('express');
const router = express.Router();
const { 
  upload,
  uploadModelFiles,
  getModelById,
  getEmbedCode,
  getPublicModelData
} = require('../controllers/modelController');
const { protect, admin } = require('../middleware/authMiddleware');
const Model = require('../models/Model');

// Upload model files for a request (admin only)
router.post(
  '/upload/:requestId',
  protect,
  admin,
  (req, res, next) => {
    console.log('Middleware - Before upload');
    next();
  },
  upload.fields([
    { name: 'glbFile', maxCount: 1 },
    { name: 'usdzFile', maxCount: 1 },
    { name: 'posterImage', maxCount: 1 }
  ]),
  (req, res, next) => {
    console.log('Middleware - After upload');
    next();
  },
  uploadModelFiles
);

// Get public model data for embeds (public)
router.get('/embed/:id', getPublicModelData);

// Get model by ID (protected)
router.get('/:id', protect, getModelById);

// Get embed code for model (protected)
router.get('/:id/embed-code', protect, getEmbedCode);

module.exports = router; 