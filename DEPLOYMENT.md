# Deployment Guide for 3D Model Platform

This document outlines the deployment steps for the 3D Model Platform application.

## Overview

The application consists of:
1. Frontend React application (deployed on Vercel)
2. Backend Node.js API (deployed on AWS EC2 or Render.com)
3. MongoDB Atlas database

## Frontend Deployment (Vercel)

The frontend is deployed on Vercel at: https://frontend-9wbn8e677-lakshay-chetals-projects.vercel.app

### To update the frontend:

1. Make your changes to the frontend code
2. Navigate to the frontend directory: `cd frontend`
3. Deploy to Vercel: `vercel --prod`

## Backend Deployment Options

You have two options for deploying the backend:

### Option 1: AWS EC2 (Recommended)

The backend is currently deployed on EC2 at: ec2-18-233-151-230.compute-1.amazonaws.com

For detailed instructions, see [EC2_DEPLOYMENT.md](EC2_DEPLOYMENT.md)

#### Quick Setup:

1. Launch an Amazon EC2 instance with Amazon Linux 2023
2. Configure security groups to allow HTTP (80), HTTPS (443), and SSH (22)
3. Copy the contents of `ec2-user-data.sh` into the "User Data" section when launching the instance
4. After the instance is running, note its public DNS or IP address
5. Update your frontend configuration to point to the EC2 instance:
   ```json
   {
     "rewrites": [
       { 
         "source": "/api/:path*", 
         "destination": "http://your-ec2-public-dns/api/:path*" 
       },
       { 
         "source": "/(.*)", 
         "destination": "/index.html" 
       }
     ]
   }
   ```
6. Redeploy your frontend: `cd frontend && vercel --prod`

### Option 2: Render.com

#### Setup on Render.com:

1. Create an account on [Render.com](https://render.com)
2. Connect your GitHub repository 
3. Create a new Web Service
4. Use the following settings:
   - Name: 3d-model-platform-api
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `node backend/server.js`
   - Environment Variables: (These are already defined in render.yaml)
     - PORT: 8000
     - NODE_ENV: production
     - MONGODB_URI: (your MongoDB connection string)
     - JWT_SECRET: (generate a secure random string)
     - UPLOAD_DIR: /opt/render/project/src/backend/uploads
     - FRONTEND_URL: https://frontend-9wbn8e677-lakshay-chetals-projects.vercel.app

#### To deploy manually via render.yaml:

1. Install Render CLI: `npm install -g @render/cli`
2. Login to Render: `render login`
3. Deploy: `render deploy`

## Database (MongoDB Atlas)

The application uses MongoDB Atlas. The connection string is already configured in the environment variables.

## Testing the Deployment

1. Frontend should be accessible at: https://frontend-9wbn8e677-lakshay-chetals-projects.vercel.app
2. Backend API will be available at your EC2 instance or Render.com URL
3. Test login with:
   - Admin: admin@example.com / password123
   - User: user@example.com / password123

## Troubleshooting

- If the frontend can't connect to the backend, verify the CORS settings in backend/server.js or Nginx configuration
- Check that environment variables are correctly set in both Vercel and your backend
- For file upload issues, ensure the UPLOAD_DIR is correctly set and writable
- For EC2 instances, check the Nginx and application logs: 
  ```
  sudo cat /var/log/nginx/error.log
  pm2 logs 3d-model-api
  ``` 