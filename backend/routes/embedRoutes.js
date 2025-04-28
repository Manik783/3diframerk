const express = require('express');
const router = express.Router();
const Model = require('../models/Model');
const User = require('../models/User');
const { generateModelViewerHTML } = require('../views/modelViewer');

/**
 * @route   GET /embed/:userId/:modelId
 * @desc    Render HTML page with model-viewer for the 3D model
 * @access  Public
 */
router.get('/:userId/:modelId', async (req, res) => {
  try {
    const { userId, modelId } = req.params;
    
    console.log(`Rendering embed for user: ${userId}, model: ${modelId}`);
    
    // Validate both IDs
    if (!userId || !modelId) {
      return res.status(400).send('Invalid request: Missing user ID or model ID');
    }
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      console.error(`User not found with ID: ${userId}`);
      return res.status(404).send('User not found');
    }
    
    // Get model details
    const model = await Model.findById(modelId);
    if (!model) {
      console.error(`Model not found with ID: ${modelId}`);
      return res.status(404).send('Model not found');
    }
    
    console.log('Model found:', {
      id: model._id,
      glbFile: model.glbFile,
      usdzFile: model.usdzFile,
      posterImage: model.posterImage
    });
    
    // Generate and send HTML
    const html = generateModelViewerHTML(model, userId);
    
    // Set appropriate headers
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('X-Frame-Options', 'ALLOWALL'); // Allow embedding in iframes
    res.send(html);
  } catch (error) {
    console.error('Error serving embed HTML:', error);
    res.status(500).send('Error loading model viewer');
  }
});

module.exports = router; 