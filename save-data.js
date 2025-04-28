const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Data persistence helpers
const DATA_DIR = path.join(__dirname, 'backend/data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const REQUESTS_FILE = path.join(DATA_DIR, 'requests.json');
const MODELS_FILE = path.join(DATA_DIR, 'models.json');

// Create data directory if it doesn't exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Save data to disk
const saveData = async () => {
  try {
    // First connect to the database - just use the main one that's running
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/3dmodels');
    console.log('Connected to MongoDB for data saving');
    
    const User = require('./backend/models/User');
    const Request = require('./backend/models/Request');
    const Model = require('./backend/models/Model');
    
    const users = await User.find({});
    const requests = await Request.find({});
    const models = await Model.find({});
    
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    fs.writeFileSync(REQUESTS_FILE, JSON.stringify(requests, null, 2));
    fs.writeFileSync(MODELS_FILE, JSON.stringify(models, null, 2));
    
    console.log('Data saved to disk:');
    console.log(`- ${users.length} users`);
    console.log(`- ${requests.length} requests`);
    console.log(`- ${models.length} models`);
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

// Run the save operation
saveData(); 