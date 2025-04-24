const express = require('express');
const router = express.Router();
const { 
  uploadModelFiles,
  getModelById,
  getEmbedCode,
  getPublicModelData
} = require('../controllers/modelController');
const { uploadMiddleware } = require('../controllers/s3UploadController');
const { protect, admin } = require('../middleware/authMiddleware');

// Upload model files for a request (admin only)
router.post(
  '/upload/:requestId',
  protect,
  admin,
  (req, res, next) => {
    console.log('Middleware - Before upload');
    next();
  },
  uploadMiddleware.fields([
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