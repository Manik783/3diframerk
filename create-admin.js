// Script to create an admin user
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { MongoMemoryServer } = require('mongodb-memory-server');

async function createAdminUser() {
  let mongoServer;
  try {
    // Start MongoDB memory server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    console.log('MongoDB URL:', mongoUri);
    
    // Connect to MongoDB
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
    
    // Import the User model
    const User = require('./backend/models/User');
    
    // Create hashed password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    // First try to find an existing admin
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists, updating password...');
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();
      console.log('Admin password updated successfully');
    } else {
      // Create a new admin user
      const adminUser = new User({
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        isAdmin: true
      });
      
      await adminUser.save();
      console.log('Admin user created successfully');
    }
    
    // Create a test user
    const existingUser = await User.findOne({ email: 'user@example.com' });
    
    if (existingUser) {
      console.log('Test user already exists, updating password...');
      existingUser.password = hashedPassword;
      await existingUser.save();
      console.log('Test user password updated successfully');
    } else {
      const testUser = new User({
        name: 'Test User',
        email: 'user@example.com',
        password: hashedPassword,
        isAdmin: false
      });
      
      await testUser.save();
      console.log('Test user created successfully');
    }
    
    console.log('Users created with credentials:');
    console.log('Admin: admin@example.com / password123');
    console.log('User: user@example.com / password123');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Disconnect from MongoDB
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    }
    
    // Stop the MongoDB memory server
    if (mongoServer) {
      await mongoServer.stop();
      console.log('MongoDB memory server stopped');
    }
    
    process.exit(0);
  }
}

// Run the function
createAdminUser(); 