const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    select: false // Don't include password by default in queries
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check if entered password matches the stored hashed password
userSchema.methods.matchPassword = async function(enteredPassword) {
  try {
    if (!this.password) {
      // If password field wasn't selected in the query
      const user = await this.constructor.findById(this._id).select('+password');
      return await bcrypt.compare(enteredPassword, user.password);
    }
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    console.error('Error in matchPassword:', error);
    throw new Error('Error comparing passwords');
  }
};

const User = mongoose.model('User', userSchema);

module.exports = User; 