const path = require('path');
const multer = require('multer');
const Model = require('../models/Model');
const Request = require('../models/Request');
const { getS3Url, useS3Storage } = require('./s3UploadController');

// Setup multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'backend/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Check file type
const fileFilter = (req, file, cb) => {
  const filetypes = /glb|gltf|usdz|png|jpg|jpeg/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  
  if (extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only 3D model files (GLB, GLTF, USDZ) and images are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB max file size
});

// Generate embed code for a model
const generateEmbedCode = (model) => {
  return `<iframe
    style="width: 100%; height: 500px; border: none;"
    src="${process.env.NODE_ENV === 'production' 
      ? process.env.BASE_URL || '${window.location.origin}'
      : 'http://localhost:3000'}/embed/${model._id}"
    allow="autoplay; fullscreen; ar; xr"
    scrolling="no"
    frameborder="0"
  ></iframe>`;
};

// @desc    Upload model files for a request
// @route   POST /api/models/upload/:requestId
// @access  Private/Admin
const uploadModelFiles = async (req, res) => {
  try {
    console.log('Upload Model Files API called');
    console.log('Request params:', req.params);
    console.log('Files received:', req.files);
    
    const requestId = req.params.requestId;
    
    // Check if request exists
    const request = await Request.findById(requestId);
    if (!request) {
      console.log('Request not found with ID:', requestId);
      return res.status(404).json({ message: 'Request not found' });
    }
    
    // Check if model files were uploaded
    if (!req.files || !req.files.glbFile || !req.files.usdzFile) {
      console.log('Missing required files');
      return res.status(400).json({ message: 'Please upload GLB and USDZ files' });
    }
    
    // Get file paths - handles both S3 and local storage
    const glbFilename = req.files.glbFile[0].filename || req.files.glbFile[0].key;
    const usdzFilename = req.files.usdzFile[0].filename || req.files.usdzFile[0].key;
    const posterFilename = req.files.posterImage ? 
      (req.files.posterImage[0].filename || req.files.posterImage[0].key) : null;
    
    // Get the URLs for the files - will return S3 URLs in production or local paths in dev
    const glbPath = getS3Url(glbFilename);
    const usdzPath = getS3Url(usdzFilename);
    const posterPath = posterFilename ? getS3Url(posterFilename) : null;
    
    console.log('File paths:', { glbPath, usdzPath, posterPath });
    
    // Create model in database
    const model = new Model({
      request: requestId,
      glbFile: glbPath,
      usdzFile: usdzPath,
      posterImage: posterPath,
      uploadedBy: req.user._id,
      embedCode: generateEmbedCode({ _id: 'placeholder' }) // Temporary placeholder
    });
    
    // Save the model to get an ID
    await model.save();
    console.log('Model created with ID:', model._id);
    
    // Now update the embed code with the actual model ID
    model.embedCode = generateEmbedCode(model);
    await model.save();
    
    // Update request with model reference and status
    request.model = model._id;
    request.status = 'Completed';
    await request.save();
    
    // Success response
    return res.status(201).json({
      message: 'Model uploaded successfully',
      model
    });
    
  } catch (error) {
    console.error('Error in uploadModelFiles:', error);
    return res.status(500).json({
      message: 'Server error during upload',
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
};

// @desc    Get model by ID
// @route   GET /api/models/:id
// @access  Private
const getModelById = async (req, res) => {
  try {
    const model = await Model.findById(req.params.id)
      .populate({
        path: 'request',
        populate: { path: 'user', select: 'name email' }
      })
      .populate('uploadedBy', 'name email');
    
    if (!model) {
      res.status(404);
      throw new Error('Model not found');
    }
    
    // Check if user has access to this model
    if (
      model.request.user._id.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      res.status(401);
      throw new Error('Not authorized to access this model');
    }
    
    res.json(model);
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error.message
    });
  }
};

// @desc    Generate embed code for model
// @route   GET /api/models/:id/embed-code
// @access  Private
const getEmbedCode = async (req, res) => {
  try {
    const model = await Model.findById(req.params.id)
      .populate({
        path: 'request',
        populate: { path: 'user' }
      });
    
    if (!model) {
      res.status(404);
      throw new Error('Model not found');
    }
    
    console.log('Model:', model._id);
    console.log('Request:', model.request._id);
    console.log('Request user:', model.request.user._id);
    console.log('Current user:', req.user._id);
    console.log('Is admin:', req.user.isAdmin);
    
    // Check if user has access to this model
    if (
      model.request.user._id.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      res.status(401);
      throw new Error('Not authorized to access this model');
    }
    
    res.json({ embedCode: model.embedCode });
  } catch (error) {
    console.error('Error in getEmbedCode:', error);
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
};

// @desc    Expose model viewer files for a public embed
// @route   GET /api/models/embed/:id
// @access  Public
const getPublicModelData = async (req, res) => {
  try {
    const model = await Model.findById(req.params.id);
    
    if (!model) {
      res.status(404);
      throw new Error('Model not found');
    }
    
    // For S3 URLs, they are already absolute, so no need to prepend baseUrl
    const isS3Url = (url) => url && (url.startsWith('https://') || url.startsWith('http://'));
    
    // If not using S3, construct full URLs with the base URL
    const getFullUrl = (path) => {
      if (!path) return null;
      if (isS3Url(path)) return path;
      
      const baseUrl = process.env.NODE_ENV === 'production'
        ? process.env.BASE_URL || req.protocol + '://' + req.get('host')
        : 'http://localhost:8000';
      
      return `${baseUrl}${path}`;
    };
    
    // Provide the URLs needed for embedding
    res.json({
      glbFile: getFullUrl(model.glbFile),
      usdzFile: getFullUrl(model.usdzFile),
      posterImage: model.posterImage ? getFullUrl(model.posterImage) : null
    });
  } catch (error) {
    console.error('Error in getPublicModelData:', error);
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    res.json({
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
};

module.exports = {
  upload,
  uploadModelFiles,
  getModelById,
  getEmbedCode,
  getPublicModelData
}; 