const path = require('path');
const multer = require('multer');
const Model = require('../models/Model');
const Request = require('../models/Request');
const fs = require('fs');
const asyncHandler = require('express-async-handler');
const { uploadFileToS3 } = require('../utils/awsService');
const mongoose = require('mongoose');

// Setup multer storage for temporary file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Store files temporarily before uploading to S3
    const tempDir = 'backend/temp';
    // Ensure temp directory exists
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Check file type
const fileFilter = (req, file, cb) => {
  const filetypes = /glb|usdz/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  
  if (extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only 3D model files (GLB, USDZ) are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB max file size
});

// Generate embed code for a model
const generateEmbedCode = (model) => {
  return `<iframe
    style="width: 100%; height: 500px; border: none;"
    src="${process.env.NODE_ENV === 'production' 
      ? '${window.location.origin}' 
      : 'http://localhost:3000'}/embed/${model._id}"
    allow="autoplay; fullscreen; ar; xr"
    scrolling="no"
    frameborder="0"
  ></iframe>`;
};

// Function to ensure uploads directory exists
const ensureUploadsDir = () => {
  const uploadDir = process.env.UPLOAD_DIR || 'backend/uploads';
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`Created uploads directory: ${uploadDir}`);
  }
  return uploadDir;
};

// Function to save file to local disk as fallback
const saveFileLocally = (file, userId) => {
  const uploadDir = ensureUploadsDir();
  const userDir = path.join(uploadDir, userId.toString());
  
  // Create user directory if it doesn't exist
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
  }
  
  // Generate unique filename to avoid collisions
  const filename = `${Date.now()}-${file.originalname}`;
  const filePath = path.join(userDir, filename);
  
  // Copy file from temp location to uploads directory
  fs.copyFileSync(file.path, filePath);
  
  // Return local URL for the file
  return {
    localPath: filePath,
    url: `/api/uploads/${userId}/${filename}`
  };
};

// @desc    Upload model files for a request
// @route   POST /api/models/upload/:requestId
// @access  Private/Admin
const uploadModelFiles = asyncHandler(async (req, res) => {
  console.log('API call: uploadModelFiles');
  console.log('Files received:', req.files);
  console.log('Request params:', req.params);
  
  try {
    const requestId = req.params.requestId;
    if (!requestId) {
      return res.status(400).json({ success: false, message: 'Request ID is required' });
    }
    
    // Check if request exists
    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    
    // Check for required files
    if (!req.files || !req.files.glbFile || !req.files.usdzFile) {
      return res.status(400).json({ 
        success: false, 
        message: 'Both GLB and USDZ files are required',
        debug: {
          hasFiles: !!req.files,
          hasGlb: req.files ? !!req.files.glbFile : false,
          hasUsdz: req.files ? !!req.files.usdzFile : false
        }
      });
    }
    
    const glbFile = req.files.glbFile[0];
    const usdzFile = req.files.usdzFile[0];
    
    // Process poster image if provided
    let posterImageData = null;
    if (req.files.posterImage && req.files.posterImage.length > 0) {
      posterImageData = req.files.posterImage[0];
    }
    
    const userId = req.user._id.toString();
    
    // Check if AWS credentials are properly configured
    const awsConfigured = process.env.AWS_ACCESS_KEY_ID && 
                         process.env.AWS_SECRET_ACCESS_KEY && 
                         process.env.AWS_REGION &&
                         process.env.S3_BUCKET_NAME;
    
    console.log('AWS configuration status:', {
      configured: !!awsConfigured,
      accessKeyId: !!process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: !!process.env.AWS_SECRET_ACCESS_KEY,
      region: !!process.env.AWS_REGION,
      bucketName: !!process.env.S3_BUCKET_NAME
    });
    
    let glbFileUrl, usdzFileUrl, posterImageUrl = null;
    
    // Determine if we should use S3 or local storage
    const useS3 = awsConfigured;
    
    if (useS3) {
      try {
        console.log('Attempting to upload files to S3');
        
        const glbFileData = await uploadFileToS3(glbFile, userId);
        glbFileUrl = glbFileData.cloudFrontUrl;
        
        const usdzFileData = await uploadFileToS3(usdzFile, userId);
        usdzFileUrl = usdzFileData.cloudFrontUrl;
        
        if (posterImageData) {
          const posterImageFileData = await uploadFileToS3(posterImageData, userId);
          posterImageUrl = posterImageFileData.cloudFrontUrl;
        }
        
        console.log('Successfully uploaded files to S3');
      } catch (awsError) {
        console.error('Error uploading to S3:', awsError);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload files to S3',
          error: awsError.message
        });
      }
    } else {
      console.log('Using local storage for files');
      
      // Ensure uploads directory exists
      const uploadDir = process.env.UPLOAD_DIR || 'backend/uploads';
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      // Save files locally
      const glbFileData = saveFileLocally(glbFile, userId);
      glbFileUrl = glbFileData.url;
      
      const usdzFileData = saveFileLocally(usdzFile, userId);
      usdzFileUrl = usdzFileData.url;
      
      if (posterImageData) {
        const posterImageFileData = saveFileLocally(posterImageData, userId);
        posterImageUrl = posterImageFileData.url;
      }
      
      console.log('Successfully saved files locally');
    }
    
    // Generate the embed code for the model
    const baseUrl = process.env.NODE_ENV === 'production'
      ? process.env.BASE_URL || 'https://yourdeployedapp.com'
      : 'http://localhost:3000';
    
    // Create model in database
    console.log('Creating model in database');
    const model = await Model.create({
      request: requestId,
      glbFile: glbFileUrl,
      usdzFile: usdzFileUrl,
      posterImage: posterImageUrl,
      uploadedBy: req.user._id,
      embedCode: `<iframe 
  src="${baseUrl}/embed/${mongoose.Types.ObjectId()}" 
  width="600" 
  height="400" 
  frameborder="0" 
  allowfullscreen
  allow="autoplay; fullscreen; ar; xr"
></iframe>`
    });
    
    // Update the embed code with the actual model ID
    model.embedCode = `<iframe 
  src="${baseUrl}/embed/${model._id}" 
  width="600" 
  height="400" 
  frameborder="0" 
  allowfullscreen
  allow="autoplay; fullscreen; ar; xr"
></iframe>`;
    
    await model.save();
    
    // Update request status
    request.status = 'Completed';
    request.model = model._id;
    await request.save();
    
    // Clean up temporary files
    if (fs.existsSync(glbFile.path)) fs.unlinkSync(glbFile.path);
    if (fs.existsSync(usdzFile.path)) fs.unlinkSync(usdzFile.path);
    if (posterImageData && fs.existsSync(posterImageData.path)) fs.unlinkSync(posterImageData.path);
    
    return res.status(201).json({
      success: true,
      message: `Model files uploaded successfully ${useS3 ? 'to S3' : 'to local storage'}`,
      model: {
        id: model._id,
        glbFile: glbFileUrl,
        usdzFile: usdzFileUrl,
        posterImage: posterImageUrl,
        embedCode: model.embedCode,
      },
    });
  } catch (error) {
    console.error('Error in uploadModelFiles:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload model files',
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack,
    });
  }
});

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
    console.log('getEmbedCode called with ID:', req.params.id);
    
    const model = await Model.findById(req.params.id)
      .populate({
        path: 'request',
        populate: { path: 'user' }
      });
    
    if (!model) {
      console.error('Model not found with ID:', req.params.id);
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
    console.log('getPublicModelData called with ID:', req.params.id);
    
    const model = await Model.findById(req.params.id);
    
    if (!model) {
      console.error('Model not found with ID:', req.params.id);
      res.status(404);
      throw new Error('Model not found');
    }
    
    console.log('Model found:', {
      id: model._id,
      glbFile: model.glbFile,
      usdzFile: model.usdzFile,
      posterImage: model.posterImage
    });
    
    // Return the CloudFront URLs directly
    const response = {
      glbFile: model.glbFile,
      usdzFile: model.usdzFile,
      posterImage: model.posterImage
    };
    
    console.log('Sending model data response:', response);
    
    res.json(response);
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