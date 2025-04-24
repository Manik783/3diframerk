#!/bin/bash

# EC2 Setup Script for 3D Model Platform Backend

echo "Setting up EC2 instance for 3D Model Platform Backend..."

# Update system
echo "Updating system..."
sudo yum update -y

# Install Node.js
echo "Installing Node.js..."
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install Git
echo "Installing Git..."
sudo yum install -y git

# Install PM2
echo "Installing PM2..."
sudo npm install -g pm2

# Clone repository (replace with your actual repository URL)
echo "Cloning repository..."
git clone https://github.com/yourusername/3d-model-platform.git
cd 3d-model-platform

# Install dependencies
echo "Installing dependencies..."
npm install

# Create uploads directory
echo "Creating uploads directory..."
mkdir -p backend/uploads
chmod 755 backend/uploads

# Create .env file (replace JWT_SECRET with a secure value)
echo "Creating .env file..."
cat > .env << 'EOL'
PORT=8000
NODE_ENV=production
MONGODB_URI=mongodb+srv://lakshaychetal482:xrcVoybM2f2ETMhr@clusterrk.de7xair.mongodb.net/3d-model-platform?retryWrites=true&w=majority&appName=Clusterrk
JWT_SECRET=your-secure-jwt-secret
UPLOAD_DIR=backend/uploads
FRONTEND_URL=https://frontend-eu4sd69xi-lakshay-chetals-projects.vercel.app
EOL

# Install and configure Nginx
echo "Installing and configuring Nginx..."
sudo yum install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Get instance public DNS
EC2_PUBLIC_DNS=$(curl -s http://169.254.169.254/latest/meta-data/public-hostname)
EC2_PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

# Create Nginx config
echo "Creating Nginx configuration..."
sudo tee /etc/nginx/conf.d/backend.conf > /dev/null << EOL
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

# Test and restart Nginx
sudo nginx -t
sudo systemctl restart nginx

# Start the application with PM2
echo "Starting application with PM2..."
pm2 start backend/server.js --name "3d-model-api"
pm2 startup
pm2 save

echo "Setup complete! Your backend is running."
echo "EC2 Public DNS: ${EC2_PUBLIC_DNS}"
echo "EC2 Public IP: ${EC2_PUBLIC_IP}"
echo ""
echo "Update your Vercel frontend configuration to point to this backend:"
echo "1. Edit frontend/vercel.json"
echo "2. Set the API destination to: http://${EC2_PUBLIC_DNS}/api/:path*"
echo "3. Redeploy your frontend with: cd frontend && vercel --prod" 