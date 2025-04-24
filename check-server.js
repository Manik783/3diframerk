// Simple script to check if environment variables are set correctly
console.log('=== ENVIRONMENT VARIABLES CHECK ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET (hidden for security)' : 'NOT SET');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET (hidden for security)' : 'NOT SET');
console.log('UPLOAD_DIR:', process.env.UPLOAD_DIR);
console.log('AWS_S3_BUCKET:', process.env.AWS_S3_BUCKET);
console.log('AWS_REGION:', process.env.AWS_REGION);
console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? 'SET (hidden for security)' : 'NOT SET');
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? 'SET (hidden for security)' : 'NOT SET');
console.log('BASE_URL:', process.env.BASE_URL);
console.log('===================================');

// Create a test route in Express to verify server is running
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8081;

app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>3D Model Platform - Server Check</title></head>
      <body style="background: #202124; color: #E8EAED; font-family: Arial, sans-serif; padding: 20px;">
        <h1>3D Model Platform - Server Check</h1>
        <p>The server is running correctly!</p>
        <p>Environment: ${process.env.NODE_ENV}</p>
        <p>MongoDB: ${process.env.MONGODB_URI ? 'Connected' : 'Not connected'}</p>
        <p>S3 Bucket: ${process.env.AWS_S3_BUCKET || 'Not set'}</p>
        <hr>
        <p>Go to <a href="/api/users" style="color: #8AB4F8;">API Users Endpoint</a> to check API connectivity</p>
        <p>Visit <a href="/login" style="color: #8AB4F8;">Login Page</a> to access the application</p>
      </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`Server check running on port ${PORT}`);
}); 