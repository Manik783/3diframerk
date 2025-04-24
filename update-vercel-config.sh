#!/bin/bash

# Script to update Vercel configuration to point to EC2 backend

# Check if EC2 public DNS/IP was provided
if [ -z "$1" ]; then
  echo "Please provide the EC2 public DNS or IP as an argument"
  echo "Usage: ./update-vercel-config.sh ec2-123-456-789-012.compute-1.amazonaws.com"
  exit 1
fi

EC2_ADDRESS=$1

echo "Updating Vercel configuration to point to EC2 backend at: $EC2_ADDRESS"

# Check if frontend/vercel.json exists
if [ ! -f frontend/vercel.json ]; then
  echo "Error: frontend/vercel.json not found!"
  exit 1
fi

# Update frontend/vercel.json with the EC2 address
cat > frontend/vercel.json << EOL
{
  "rewrites": [
    { 
      "source": "/api/:path*", 
      "destination": "http://${EC2_ADDRESS}/api/:path*" 
    },
    { 
      "source": "/(.*)", 
      "destination": "/index.html" 
    }
  ],
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "framework": "create-react-app",
  "cleanUrls": true
}
EOL

echo "Vercel configuration updated successfully."
echo "Don't forget to redeploy your frontend:"
echo "cd frontend && vercel --prod" 