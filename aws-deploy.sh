#!/bin/bash

# Step 1: Install dependencies
echo "Installing dependencies..."
npm install

# Step 2: Build the frontend
echo "Building frontend..."
cd frontend && npm install && npm run build && cd ..

# Step 3: Create deployment package
echo "Creating deployment package..."
ZIP_FILE="deployment-$(date +%Y%m%d%H%M%S).zip"
zip -r $ZIP_FILE . -x "node_modules/*" "frontend/node_modules/*" "frontend/src/*" ".git/*" ".ebextensions/*" ".platform/*"

# Step 4: Check if AWS credentials are configured
if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
  echo "AWS credentials not found in environment variables. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY."
  echo "Skipping S3 upload."
else
  # Upload deployment package to S3
  echo "Uploading deployment package to S3..."
  aws s3 cp $ZIP_FILE s3://your-s3-bucket-name/$ZIP_FILE
  echo "Deployment package created and uploaded to S3: s3://your-s3-bucket-name/$ZIP_FILE"
fi

echo "Deployment package created: $ZIP_FILE"
echo "You can now deploy using AWS EC2 or other AWS services"
echo "Make sure to set environment variables for your AWS deployment:"
echo "- NODE_ENV=production"
echo "- PORT=8081"
echo "- MONGODB_URI=mongodb+srv://username:password@yourcluster.mongodb.net/your-database"
echo "- JWT_SECRET=your-secure-jwt-secret"
echo "- UPLOAD_DIR=/path/to/uploads"
echo "- AWS_S3_BUCKET=your-s3-bucket-name"
echo "- AWS_REGION=your-aws-region"
echo "- AWS_ACCESS_KEY_ID=your-access-key-id"
echo "- AWS_SECRET_ACCESS_KEY=your-secret-access-key" 