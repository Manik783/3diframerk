# 3D Model Platform Backend

Backend service for the 3D model platform, handling model uploads, user management, and embed code generation.

## Environment Variables

```env
NODE_ENV=production
FRONTEND_URL=https://frontend-seven-omega-33.vercel.app
BACKEND_URL=https://threediframerk.onrender.com
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_BUCKET_NAME=your_bucket_name
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with the above variables

3. Start the server:
```bash
npm start
```

For development:
```bash
npm run dev
```

## API Endpoints

- `/api/users` - User management
- `/api/requests` - 3D model requests
- `/api/models` - Model uploads and management
- `/embed` - Model embed viewer

## Deployment

This backend is configured for deployment on Render.com. 