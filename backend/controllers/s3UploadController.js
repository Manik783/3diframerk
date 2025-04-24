const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');

// Configure AWS SDK
const s3Config = {
  region: process.env.AWS_REGION || 'us-east-1'
};

// Only add credentials if they're provided in environment variables
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  s3Config.accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  s3Config.secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
}

const s3 = new AWS.S3(s3Config);

// Check if we're using S3 for uploads
const useS3Storage = process.env.NODE_ENV === 'production' && process.env.AWS_S3_BUCKET;

// Configure storage for file uploads
let uploadStorage;

if (useS3Storage) {
  // Use S3 storage in production
  uploadStorage = multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET,
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const uniquePrefix = Date.now();
      cb(null, `${uniquePrefix}-${file.originalname}`);
    }
  });
} else {
  // Use local storage in development
  const fs = require('fs');
  const localUploadDir = path.join(__dirname, '../uploads');
  
  // Create the directory if it doesn't exist
  if (!fs.existsSync(localUploadDir)) {
    fs.mkdirSync(localUploadDir, { recursive: true });
  }
  
  uploadStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, localUploadDir);
    },
    filename: function (req, file, cb) {
      const uniquePrefix = Date.now();
      cb(null, `${uniquePrefix}-${file.originalname}`);
    }
  });
}

// Configure multer middleware
const uploadMiddleware = multer({
  storage: uploadStorage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['.glb', '.gltf', '.usdz', '.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only 3D model files (GLB, GLTF, USDZ) and images (JPG, PNG) are allowed'));
    }
  }
});

// Helper function to get the public URL for an S3 object
const getS3Url = (filename) => {
  if (!useS3Storage) return `/uploads/${filename}`;
  
  const bucket = process.env.AWS_S3_BUCKET;
  
  // If using CloudFront, return the CloudFront URL
  if (process.env.CLOUDFRONT_DOMAIN) {
    return `https://${process.env.CLOUDFRONT_DOMAIN}/${filename}`;
  }
  
  // Otherwise, return the S3 URL
  return `https://${bucket}.s3.amazonaws.com/${filename}`;
};

module.exports = {
  uploadMiddleware,
  getS3Url,
  useS3Storage
}; 