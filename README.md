# 3D Model Platform

A comprehensive platform for managing 3D model requests, uploads, and embedding in webpages.

## Live Demo

- Frontend: [https://frontend-kgiswly6c-lakshay-chetals-projects.vercel.app](https://frontend-kgiswly6c-lakshay-chetals-projects.vercel.app)
- Backend: Deployed on AWS EC2 at ec2-18-233-151-230.compute-1.amazonaws.com

## Features

- User authentication (login/register)
- Request 3D models
- Upload 3D models (GLB and USDZ formats)
- Generate embed codes for 3D models
- Admin dashboard for managing requests
- Dark theme UI
- Responsive design

## Tech Stack

- **Frontend**: React, Bootstrap, Axios
- **Backend**: Node.js, Express
- **Database**: MongoDB Atlas
- **Authentication**: JWT
- **File Storage**: Local filesystem (development), EC2/S3 (production)
- **Deployment**: Vercel (frontend), AWS EC2/Render.com (backend)

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- MongoDB Atlas account
- AWS account (for EC2 deployment)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd 3d-model-platform
   ```

2. Install dependencies:
   ```bash
   npm install
   cd frontend && npm install && cd ..
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with:
   ```
   PORT=8000
   MONGODB_URI=<your-mongodb-connection-string>
   JWT_SECRET=<your-secret-key>
   NODE_ENV=development
   UPLOAD_DIR=backend/uploads
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Development

- Backend server runs on: http://localhost:8000
- Frontend development server runs on: http://localhost:3000

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions. You can choose between:

1. **AWS EC2** - Full control, better for file uploads, see [EC2_DEPLOYMENT.md](EC2_DEPLOYMENT.md)
2. **Render.com** - Easier setup, managed service

## Default Users

- Admin: admin@example.com / password123
- Regular User: user@example.com / password123

## License

[MIT](LICENSE)

## Contact

For any questions or support, please contact the repository owner. 