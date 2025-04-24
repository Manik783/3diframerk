#!/bin/bash

# Script to generate a CORS configuration file to update on EC2

FRONTEND_URL="https://frontend-9wbn8e677-lakshay-chetals-projects.vercel.app"

cat << EOF
# CORS Configuration for Nginx
# Copy this to /etc/nginx/default.d/cors.conf on your EC2 instance

add_header 'Access-Control-Allow-Origin' '$FRONTEND_URL' always;
add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE' always;
add_header 'Access-Control-Allow-Headers' 'Origin, X-Requested-With, Content-Type, Accept, Authorization' always;
if (\$request_method = 'OPTIONS') {
    add_header 'Access-Control-Allow-Origin' '$FRONTEND_URL' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE' always;
    add_header 'Access-Control-Allow-Headers' 'Origin, X-Requested-With, Content-Type, Accept, Authorization' always;
    add_header 'Access-Control-Max-Age' 1728000;
    add_header 'Content-Type' 'text/plain charset=UTF-8';
    add_header 'Content-Length' 0;
    return 204;
}

# Configure this as follows on your EC2 instance:
# 1. SSH into your EC2: ssh -i "3diframe.pem" ec2-user@ec2-18-233-151-230.compute-1.amazonaws.com
# 2. Create/update the CORS config: sudo nano /etc/nginx/default.d/cors.conf
# 3. Paste the above content
# 4. Restart Nginx: sudo systemctl restart nginx
# 5. Update the .env file to include: FRONTEND_URL=$FRONTEND_URL
EOF 