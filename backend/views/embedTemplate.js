/**
 * Generates HTML for the model viewer embed
 * @param {Object} model - The model object with file URLs
 * @returns {String} - Complete HTML for the model viewer
 */
const generateModelViewerHTML = (model) => {
  // Process model URLs to ensure they have the full URL if they're local paths
  let glbFileUrl = model.glbFile;
  let usdzFileUrl = model.usdzFile;
  let posterImageUrl = model.posterImage;
  
  // If using local paths that start with /api/uploads, ensure they have the full URL
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
  if (glbFileUrl && glbFileUrl.startsWith('/api/uploads')) {
    glbFileUrl = `${backendUrl}${glbFileUrl}`;
  }
  if (usdzFileUrl && usdzFileUrl.startsWith('/api/uploads')) {
    usdzFileUrl = `${backendUrl}${usdzFileUrl}`;
  }
  if (posterImageUrl && posterImageUrl.startsWith('/api/uploads')) {
    posterImageUrl = `${backendUrl}${posterImageUrl}`;
  }

  // Get user settings or use defaults
  const userSettings = model.userSettings || { showAR: true };
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>3D Model Viewer</title>
  <script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js?v=${process.env.EMBED_BUILD || Date.now()}"></script>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      background: #fff;
      text-align: center;
    }
    
    model-viewer {
      width: 100%;
      height: 500px;
      background-color: #f9f9f9;
      margin: 0 auto;
      --poster-color: transparent;
      --progress-bar-color: #000;
      --progress-mask: transparent;
      /* Override default AR button styling */
      --ar-button-display: none !important;
    }
    
    /* Hide default AR button */
    model-viewer::part(ar-button) {
      display: none !important;
    }
    
    .ar-button-container {
      display: flex;
      justify-content: center;
      margin-top: 20px;
      margin-bottom: 20px;
    }
    
    .ar-button {
      background-color: #000000 !important;
      color: #ffffff !important;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-weight: 600;
      font-size: 16px;
      padding: 12px 24px;
      border: none;
      border-radius: 48px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
      transition: all 0.2s ease;
      position: relative;
      overflow: hidden;
      z-index: 100;
    }
    
    .ar-button:hover {
      background-color: #222222 !important;
      transform: translateY(-1px);
      box-shadow: 0 7px 14px rgba(0, 0, 0, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);
    }
    
    .ar-button:active {
      transform: translateY(1px);
      box-shadow: 0 3px 5px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.08);
    }
    
    .ar-button .ar-icon {
      margin-right: 8px;
      display: inline-block;
      width: 20px;
      height: 20px;
    }
    
    .ar-toast {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background-color: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 1000;
      display: none;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
    
    /* QR code for desktop */
    .qr-code-container {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.7);
      z-index: 9999;
      align-items: center;
      justify-content: center;
      flex-direction: column;
    }
    
    .qr-code-inner {
      background-color: white;
      padding: 20px;
      border-radius: 12px;
      max-width: 300px;
      text-align: center;
    }
    
    .qr-code-inner h3 {
      margin-top: 0;
      font-size: 18px;
    }
    
    .qr-code-inner p {
      margin-bottom: 20px;
      font-size: 14px;
    }
    
    .qr-code-inner .close-button {
      margin-top: 20px;
      padding: 8px 16px;
      background-color: #000;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    
    @media (max-width: 768px) {
      model-viewer {
        height: 400px;
      }
    }
    
    @media (max-width: 480px) {
      model-viewer {
        height: 350px;
      }
      
      .ar-button {
        font-size: 14px;
        padding: 10px 20px;
      }
    }
  </style>
</head>
<body>
  <!-- 3D Model Viewer Component -->
  <model-viewer 
    id="modelViewer"
    src="${glbFileUrl}" 
    ios-src="${usdzFileUrl}" 
    ${posterImageUrl ? `poster="${posterImageUrl}"` : ''}
    camera-controls 
    auto-rotate 
    shadow-intensity="1"
    environment-image="neutral"
    alt="3D Model">
  </model-viewer>
  
  <!-- Custom AR Button (always shown) -->
  <div class="ar-button-container">
    <button id="arButton" class="ar-button">
      <svg class="ar-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white">
        <path d="M9.5,6.5v3h-3v-3H9.5 M11,5H5v6h6V5L11,5z M9.5,14.5v3h-3v-3H9.5 M11,13H5v6h6V13L11,13z M17.5,6.5v3h-3v-3H17.5 M19,5
          h-6v6h6V5L19,5z M13,13h1.5v1.5H13V13z M14.5,14.5H16V16h-1.5V14.5z M16,13h1.5v1.5H16V13z M13,16h1.5v1.5H13V16z M14.5,17.5H16V19
          h-1.5V17.5z M16,16h1.5v1.5H16V16z M17.5,14.5H19V16h-1.5V14.5z M17.5,17.5H19V19h-1.5V17.5z M22,7h-2v1.5h1.5V11H22V7z M22,17
          v-3h-1.5v1.5H19V17H22z M7,22h3v-1.5H8.5V19H7V22z M17,22h3v-3h-1.5v1.5H17V22z"/>
      </svg>
      View in AR
    </button>
  </div>
  
  <!-- Toast Message for Notifications -->
  <div id="arToast" class="ar-toast"></div>
  
  <!-- QR Code Modal for Desktop -->
  <div id="qrCodeModal" class="qr-code-container">
    <div class="qr-code-inner">
      <h3>View in AR on your mobile device</h3>
      <p>Scan this QR code with your smartphone to experience this 3D model in AR</p>
      <div id="qrCode"></div>
      <button class="close-button" id="closeQr">Close</button>
    </div>
  </div>
  
  <!-- QR Code Library -->
  <script src="https://cdn.jsdelivr.net/npm/qrcode.js@1.0.3/qrcode.min.js"></script>
  
  <script>
    // Device detection
    const deviceDetection = () => {
      const ua = navigator.userAgent || navigator.vendor || window.opera;
      
      // iOS detection
      if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) {
        return 'ios';
      }
      
      // Android detection
      if (/android/i.test(ua)) {
        return 'android';
      }
      
      return 'desktop';
    };
    
    // Show toast message
    const showToast = (message, duration = 3000) => {
      const toast = document.getElementById('arToast');
      toast.textContent = message;
      toast.style.display = 'block';
      
      setTimeout(() => {
        toast.style.display = 'none';
      }, duration);
    };
    
    // Generate and show QR code modal
    const showQrCode = (url) => {
      const modal = document.getElementById('qrCodeModal');
      const qrContainer = document.getElementById('qrCode');
      const closeBtn = document.getElementById('closeQr');
      
      // Clear previous QR code
      qrContainer.innerHTML = '';
      
      // Generate QR code
      QRCode.toCanvas(qrContainer, window.location.href, { width: 200 }, (error) => {
        if (error) console.error('Error generating QR code:', error);
      });
      
      // Show modal
      modal.style.display = 'flex';
      
      // Close button
      closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
      });
      
      // Close on outside click
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.style.display = 'none';
        }
      });
    };
    
    // Initialize AR button
    const initARButton = () => {
      const arButton = document.getElementById('arButton');
      const modelViewer = document.getElementById('modelViewer');
      const device = deviceDetection();
      
      // Always show the AR button, regardless of device
      arButton.addEventListener('click', () => {
        try {
          if (device === 'ios') {
            // iOS - QuickLook
            window.location.href = '${usdzFileUrl}';
          } else if (device === 'android') {
            // Android browser - Use Scene Viewer if available
            const androidUrl = 'intent://arvr.google.com/scene-viewer/1.0?file=' + 
              encodeURIComponent('${glbFileUrl}') + 
              '&mode=ar_only#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;S.browser_fallback_url=' + 
              encodeURIComponent(window.location.href) + 
              ';end;';
            window.location = androidUrl;
          } else {
            // Desktop - Show QR code
            showQrCode(window.location.href);
          }
        } catch (error) {
          console.error('AR activation error:', error);
          showToast('Could not activate AR. Please try again on a compatible device.');
        }
      });
    };
    
    // Initialize when the page loads
    window.addEventListener('DOMContentLoaded', () => {
      // Force hide the built-in AR button
      const modelViewer = document.getElementById('modelViewer');
      
      // Sometimes the ar-button shows up even with CSS, so we observe and remove it
      const observer = new MutationObserver((mutations) => {
        const arButton = modelViewer.shadowRoot?.querySelector('button[slot="ar-button"]');
        if (arButton) {
          arButton.style.display = 'none';
          arButton.style.opacity = '0';
          arButton.style.visibility = 'hidden';
        }
      });
      
      // Start observing
      observer.observe(modelViewer, { childList: true, subtree: true });
      
      // Initialize our custom AR button
      initARButton();
    });
  </script>
</body>
</html>
  `;
};

module.exports = { generateModelViewerHTML };
