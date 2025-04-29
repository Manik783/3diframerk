const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (userId) => {
  try {
    return jwt.sign(
      { id: userId },
      process.env.JWT_SECRET || 'fallback_secret_key_123',
      { expiresIn: '30d' }
    );
  } catch (error) {
    console.error('Error generating token:', error);
    throw new Error('Error generating authentication token');
  }
};

module.exports = generateToken; 