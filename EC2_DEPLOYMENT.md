# EC2 Backend Deployment Guide

This document outlines how to deploy the 3D Model Platform backend on AWS EC2.

## Step 1: Launch an EC2 Instance

1. Log in to the AWS Management Console
2. Navigate to EC2 Dashboard and click "Launch Instance"
3. Choose Amazon Linux 2023 AMI
4. Select t2.micro (free tier eligible) or a larger instance if needed
5. Configure instance details as needed
6. Add storage (default 8GB is sufficient)
7. Add tags (optional)
8. Configure security group:
   - Allow SSH (port 22) from your IP
   - Allow HTTP (port 80) from anywhere
   - Allow HTTPS (port 443) from anywhere
   - Allow Custom TCP (port 8000) from anywhere
9. Review and launch the instance
10. Create or select an existing key pair (.pem file) and download it
11. Launch the instance

## Step 2: Connect to Your EC2 Instance

1. Open a terminal
2. Change permissions for your key file:
   ```
   chmod 400 your-key-file.pem
   ```
3. Connect to your instance:
   ```
   ssh -i your-key-file.pem ec2-user@your-ec2-public-dns
   ```

## Step 3: Set Up the EC2 Environment

1. Update the system:
   ```
   sudo yum update -y
   ```

2. Install Node.js:
   ```
   curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
   sudo yum install -y nodejs
   ```

3. Install Git:
   ```
   sudo yum install -y git
   ```

4. Install PM2 (process manager):
   ```
   sudo npm install -g pm2
   ```

## Step 4: Clone and Set Up Your Project

1. Clone your repository:
   ```
   git clone your-repository-url
   cd 3d-model-platform
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a .env file:
   ```
   cat > .env << 'EOL'
   PORT=8000
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://lakshaychetal482:xrcVoybM2f2ETMhr@clusterrk.de7xair.mongodb.net/3d-model-platform?retryWrites=true&w=majority&appName=Clusterrk
   JWT_SECRET=your-secure-jwt-secret
   UPLOAD_DIR=backend/uploads
   FRONTEND_URL=https://frontend-eu4sd69xi-lakshay-chetals-projects.vercel.app
   EOL
   ```

4. Create uploads directory:
   ```
   mkdir -p backend/uploads
   chmod 755 backend/uploads
   ```

## Step 5: Set Up Nginx as a Reverse Proxy

1. Install Nginx:
   ```
   sudo yum install -y nginx
   ```

2. Start Nginx:
   ```
   sudo systemctl start nginx
   sudo systemctl enable nginx
   ```

3. Configure Nginx:
   ```
   sudo nano /etc/nginx/conf.d/backend.conf
   ```

4. Add this configuration:
   ```
   server {
       listen 80;
       server_name your-ec2-public-dns;

       location /api {
           proxy_pass http://localhost:8000/api;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       }
   }
   ```

5. Test and restart Nginx:
   ```
   sudo nginx -t
   sudo systemctl restart nginx
   ```

## Step 6: Start Your Application

1. Start the application with PM2:
   ```
   pm2 start backend/server.js --name "3d-model-api"
   ```

2. Set PM2 to start on boot:
   ```
   pm2 startup
   pm2 save
   ```

## Step 7: Update Your Vercel Frontend

1. Get your EC2 instance's public DNS or IP
2. Update your Vercel configuration in `frontend/vercel.json`:
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

3. Redeploy your frontend:
   ```
   cd frontend && vercel --prod
   ```

## Step 8: Secure Your API with HTTPS (Optional but Recommended)

1. Register a domain name and point it to your EC2 instance
2. Install Certbot:
   ```
   sudo yum install -y certbot python3-certbot-nginx
   ```
3. Obtain SSL certificate:
   ```
   sudo certbot --nginx -d yourdomain.com
   ```
4. Update your Vercel configuration to use HTTPS

## Step 9: Monitor Your Backend

1. Check application status:
   ```
   pm2 status
   ```

2. View logs:
   ```
   pm2 logs 3d-model-api
   ```

3. Monitor resources:
   ```
   pm2 monit
   ```

## Troubleshooting

- Check Nginx error logs: `sudo cat /var/log/nginx/error.log`
- Check application logs: `pm2 logs 3d-model-api`
- Verify security groups allow traffic on required ports
- Ensure MongoDB connection string is correct
- Verify CORS settings in backend/server.js allow your frontend URL 