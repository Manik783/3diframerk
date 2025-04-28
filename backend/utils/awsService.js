const path = require('path');
const fs = require('fs');

// Check if AWS is configured
const awsConfigured = process.env.AWS_ACCESS_KEY_ID && 
                      process.env.AWS_SECRET_ACCESS_KEY && 
                      process.env.AWS_REGION &&
                      process.env.S3_BUCKET_NAME;

let AWS, s3;
try {
  if (awsConfigured) {
    AWS = require('aws-sdk');
    // Load AWS credentials from environment variables
    AWS.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION
    });
    
    // Initialize S3 client
    s3 = new AWS.S3();
    console.log('AWS S3 client initialized successfully');
  } else {
    console.log('AWS credentials not fully configured, S3 functionality will be unavailable');
  }
} catch (error) {
  console.error('Error initializing AWS S3 client:', error.message);
}

/**
 * Upload file to AWS S3 bucket
 * @param {Object} fileData - File data object
 * @param {string} fileData.path - Local path to the file
 * @param {string} fileData.originalname - Original file name
 * @param {string} fileData.mimetype - File MIME type
 * @param {number} fileData.size - File size in bytes
 * @param {string} userId - User ID for the path
 * @returns {Promise<Object>} S3 upload result and CloudFront URL
 */
const uploadFileToS3 = async (fileData, userId) => {
  // Check if AWS S3 is available
  if (!awsConfigured || !s3) {
    console.log('AWS S3 not available, returning mock CloudFront URL');
    // Return a mock response that matches the structure of an S3 upload
    return {
      cloudFrontUrl: `/api/uploads/${userId}/${fileData.originalname}`
    };
  }

  // Validate file type
  const fileExtension = path.extname(fileData.originalname).toLowerCase();
  if (!['.glb', '.usdz', '.jpg', '.jpeg', '.png', '.gif'].includes(fileExtension)) {
    throw new Error(`Invalid file type: ${fileExtension}. Only GLB, USDZ, and image files are allowed.`);
  }

  // Validate file size (100MB max)
  const MAX_SIZE = 100 * 1024 * 1024; // 100MB in bytes
  if (fileData.size > MAX_SIZE) {
    throw new Error('File size exceeds the maximum limit of 100MB.');
  }

  // Create the S3 key (path) using userId and original filename
  const s3Key = `models/${userId}/${fileData.originalname}`;
  
  // Read the file from disk
  const fileContent = fs.readFileSync(fileData.path);
  
  // Set up S3 upload parameters
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: s3Key,
    Body: fileContent,
    ContentType: fileData.mimetype
  };

  try {
    // Upload to S3
    const s3Response = await s3.upload(params).promise();
    console.log('File uploaded successfully to S3:', s3Response.Location);
    
    // Generate CloudFront URL
    const cloudFrontDomain = process.env.CLOUDFRONT_DOMAIN || 'https://d29pu3it4iogfy.cloudfront.net';
    const cloudFrontUrl = `${cloudFrontDomain}/${s3Key}`;
    console.log('CloudFront URL generated:', cloudFrontUrl);
    
    return {
      s3Response,
      cloudFrontUrl
    };
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw new Error(`Failed to upload file to S3: ${error.message}`);
  }
};

module.exports = {
  uploadFileToS3,
  isAwsConfigured: !!awsConfigured
}; 