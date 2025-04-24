#!/bin/bash

# EC2 User Data Script for 3D Model Platform Backend
# Copy this into the "User data" section when launching an EC2 instance

# Update system
yum update -y

# Install Git, Node.js, and other dependencies
yum install -y git
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs nginx

# Install PM2 globally
npm install -g pm2

# Clone the repository (replace with your actual repository URL)
cd /home/ec2-user
git clone https://github.com/yourusername/3d-model-platform.git
cd 3d-model-platform

# Install dependencies
npm install

# Create uploads directory
mkdir -p backend/uploads
chmod 755 backend/uploads

# Create .env file
cat > .env << 'EOL'
PORT=8000
NODE_ENV=production
MONGODB_URI=mongodb+srv://lakshaychetal482:xrcVoybM2f2ETMhr@clusterrk.de7xair.mongodb.net/3d-model-platform?retryWrites=true&w=majority&appName=Clusterrk
JWT_SECRET=your-secure-jwt-secret
UPLOAD_DIR=backend/uploads
FRONTEND_URL=https://frontend-eu4sd69xi-lakshay-chetals-projects.vercel.app
EOL

# Set proper ownership
chown -R ec2-user:ec2-user /home/ec2-user/3d-model-platform

# Get instance public DNS
EC2_PUBLIC_DNS=$(curl -s http://169.254.169.254/latest/meta-data/public-hostname)
EC2_PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

# Create Nginx config
cat > /etc/nginx/conf.d/backend.conf << EOL
server {
    listen 80;
    server_name ${EC2_PUBLIC_DNS} ${EC2_PUBLIC_IP};

    location /api {
        proxy_pass http://localhost:8000/api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
EOL

# Configure CORS for Nginx
cat > /etc/nginx/default.d/cors.conf << EOL
add_header 'Access-Control-Allow-Origin' 'https://frontend-eu4sd69xi-lakshay-chetals-projects.vercel.app' always;
add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE' always;
add_header 'Access-Control-Allow-Headers' 'Origin, X-Requested-With, Content-Type, Accept, Authorization' always;
if (\$request_method = 'OPTIONS') {
    add_header 'Access-Control-Allow-Origin' 'https://frontend-eu4sd69xi-lakshay-chetals-projects.vercel.app' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE' always;
    add_header 'Access-Control-Allow-Headers' 'Origin, X-Requested-With, Content-Type, Accept, Authorization' always;
    add_header 'Access-Control-Max-Age' 1728000;
    add_header 'Content-Type' 'text/plain charset=UTF-8';
    add_header 'Content-Length' 0;
    return 204;
}
EOL

# Start Nginx
systemctl start nginx
systemctl enable nginx

# Start the application with PM2
cd /home/ec2-user/3d-model-platform
sudo -u ec2-user bash -c "pm2 start backend/server.js --name '3d-model-api'"
sudo -u ec2-user bash -c "pm2 startup"
sudo -u ec2-user bash -c "pm2 save"

# Create a file with instance info for reference
cat > /home/ec2-user/instance-info.txt << EOL
EC2 Public DNS: ${EC2_PUBLIC_DNS}
EC2 Public IP: ${EC2_PUBLIC_IP}

Update your Vercel frontend configuration to point to this backend:
1. Edit frontend/vercel.json
2. Set the API destination to: http://${EC2_PUBLIC_DNS}/api/:path*
3. Redeploy your frontend with: cd frontend && vercel --prod
EOL

# Set proper ownership of the info file
chown ec2-user:ec2-user /home/ec2-user/instance-info.txt 