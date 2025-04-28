/**
 * Generates HTML for the model viewer page
 * @param {Object} model - The model object with file URLs
 * @returns {String} - Complete HTML for the model viewer
 */
const generateModelViewerHTML = (model) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>3D Model Viewer</title>
  <script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>
  <style>
    body, html {
      margin: 0;
      padding: 0;
      height: 100%;
      background: #ffffff;
    }
    model-viewer {
      width: 100%;
      height: 100%;
    }
    .ar-button {
      background-color: #4285f4;
      color: white;
      border: none;
      border-radius: 4px;
      position: absolute;
      bottom: 16px;
      right: 16px;
      padding: 8px 16px;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <model-viewer 
    src="${model.glbFile}" 
    ios-src="${model.usdzFile}"
    ${model.posterImage ? `poster="${model.posterImage}"` : ''}
    alt="3D Model" 
    auto-rotate 
    camera-controls
    ar
    ar-modes="webxr scene-viewer quick-look"
    shadow-intensity="1"
    background-color="#ffffff">
    <button slot="ar-button" class="ar-button">
      👋 View in AR
    </button>
  </model-viewer>
</body>
</html>
  `;
};

module.exports = { generateModelViewerHTML }; 