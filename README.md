# ShopXAR 3D Model Request Platform

A professional web application that allows users to submit requests for 3D models. Administrators can upload model files, and the system automatically generates iframe embed codes with AR functionality.

## Features

- **User Authentication:** Secure signup and login system
- **User Dashboard:** Submit and track 3D model requests
- **Admin Panel:** Manage requests and upload 3D model files (GLB and USDZ formats)
- **Embed Code Generation:** Create secure iframes with 3D model viewers and AR functionality
- **Responsive Design:** Works on desktop and mobile devices

## Technology Stack

- **Frontend:** React, React Router, Bootstrap
- **Backend:** Node.js, Express
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT, bcrypt
- **File Storage:** AWS S3 (with local storage fallback)
- **File Upload:** Multer
- **3D Viewing:** Google's Model Viewer

## Installation

1. Clone the repository
2. Install dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

3. Configure environment variables (copy `.env.example` to `.env` and fill in your details)

## Configuration

Create a `.env` file in the root directory with the following variables:

```
# Server Configuration
PORT=8000
NODE_ENV=development

# MongoDB Configuration
MONGO_URI=your_mongodb_connection_string

# JWT Secret for Authentication
JWT_SECRET=your_secret_key

# Uploads Directory
UPLOAD_DIR=backend/uploads

# AWS Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your_s3_bucket_name
CLOUDFRONT_DOMAIN=your_cloudfront_domain

# Frontend and Backend URLs (for production)
FRONTEND_URL=https://your-frontend-url.com
BACKEND_URL=https://your-backend-url.com
```

## Running the Application

```bash
# Run both frontend and backend in development mode
npm run dev

# Run only backend server
npm run server

# Run only frontend
npm run client
```

## API Endpoints

### Users
- `POST /api/users` - Register a new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile (protected)

### Requests
- `POST /api/requests` - Create a new request (protected)
- `GET /api/requests` - Get all requests for logged in user (protected)
- `GET /api/requests/:id` - Get a single request by ID (protected)
- `GET /api/requests/all` - Get all requests (admin only)
- `PUT /api/requests/:id/status` - Update request status (admin only)

### Models
- `POST /api/models/upload/:requestId` - Upload model files for a request (admin only)
- `GET /api/models/:id` - Get model by ID (protected)
- `GET /api/models/:id/embed-code` - Get embed code for model (protected)
- `GET /api/models/embed/:id` - Get public model data for embeds (public)
- `GET /embed/:modelId` - Direct embed HTML page for model viewing (public)

## Project Structure

```
├── backend/
│   ├── controllers/    # API controllers
│   ├── middleware/     # Express middleware
│   ├── models/         # Mongoose models
│   ├── routes/         # API routes
│   ├── uploads/        # Uploaded 3D models (local storage)
│   ├── temp/           # Temporary file storage
│   ├── utils/          # Utility functions
│   ├── views/          # HTML view templates
│   └── server.js       # Express server entry point
├── frontend/
│   ├── public/         # Static files
│   ├── src/            # React application
│   │   ├── components/ # React components
│   │   ├── pages/      # Page components
│   │   ├── services/   # API services
│   │   ├── App.js      # Main App component
│   │   └── index.js    # React entry point
│   └── package.json    # Frontend dependencies
├── .env                # Environment variables
├── .gitignore          # Git ignore rules
├── package.json        # Project dependencies
└── README.md           # Project documentation
```

## Deployment to Render.com

### Backend Deployment

1. Create a new Web Service on Render.com
2. Connect your GitHub repository
3. Use the following settings:
   - **Name**: shopxar-backend (or your preferred name)
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add environment variables from your `.env` file
5. Set `NODE_ENV` to `production` in environment variables
6. Deploy the service

### Frontend Deployment (Optional)

If you want to deploy the frontend separately:

1. Create a new Static Site on Render.com
2. Connect your GitHub repository
3. Use the following settings:
   - **Name**: shopxar-frontend (or your preferred name)
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/build`
4. Add environment variables:
   - `REACT_APP_API_URL`: Your backend URL (e.g., https://shopxar-backend.onrender.com)
5. Deploy the service

## Security Features

- Password hashing with bcrypt
- JWT authentication for protected routes
- Secure file upload validation
- Protected 3D model assets in embeds
- Fallback to local storage when AWS is not configured

## Default Users

When you start the application for the first time, two default users are created:

- **Admin**: admin@example.com / password123
- **User**: user@example.com / password123

## License

MIT 