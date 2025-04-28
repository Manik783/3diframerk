import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Spinner, Alert, Button } from 'react-bootstrap';
import { modelService } from '../services/api';

const ModelEmbed = () => {
  const [modelData, setModelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [debugMode, setDebugMode] = useState(true);
  
  const { modelId } = useParams();
  const actualModelId = typeof modelId === 'object' ? modelId._id : modelId;
  
  useEffect(() => {
    const loadModelViewerScript = () => {
      // Remove any existing script to prevent duplicates
      const existingScript = document.querySelector('script[src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"]');
      if (existingScript) {
        console.log('Model-viewer script already exists');
        return;
      }
      
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';
      script.onload = () => console.log('Model-viewer script loaded successfully');
      script.onerror = (e) => console.error('Error loading model-viewer script:', e);
      document.head.appendChild(script);
      console.log('Model-viewer script loading...');
    };
    
    const fetchModelData = async () => {
      try {
        console.log('Fetching model data for ID:', modelId, 'Using actualModelId:', actualModelId);
        const response = await modelService.getPublicModelData(actualModelId);
        console.log('Model data received:', response.data);
        
        // Validate URLs
        const data = response.data;
        if (!data.glbFile) {
          console.error('No GLB file URL received');
          setError('Model GLB file not found');
          setLoading(false);
          return;
        }
        
        // Ensure URLs are correctly formatted - CloudFront URLs should start with https://
        if (data.glbFile && !data.glbFile.startsWith('https://')) {
          console.warn('GLB URL is not formatted correctly:', data.glbFile);
        }
        
        if (data.usdzFile && !data.usdzFile.startsWith('https://')) {
          console.warn('USDZ URL is not formatted correctly:', data.usdzFile);
        }
        
        setModelData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching model data:', error);
        setError('Failed to load 3D model. Please try again later.');
        setLoading(false);
      }
    };
    
    // Load the model-viewer script
    loadModelViewerScript();
    // Fetch model data
    fetchModelData();
  }, [modelId, actualModelId]);

  const toggleDebugMode = () => {
    setDebugMode(!debugMode);
  };
  
  if (loading) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center vh-100">
        <Alert variant="danger" className="text-center">
          {error}
        </Alert>
      </Container>
    );
  }
  
  return (
    <Container fluid className="p-0 h-100 w-100">
      <Row className="m-0 h-100">
        <Col className="p-0 h-100">
          {modelData && (
            <>
              {debugMode && (
                <div style={{ position: 'absolute', top: 0, left: 0, padding: '8px', zIndex: 10, background: 'rgba(0,0,0,0.7)', color: 'white', fontSize: '12px', maxWidth: '100%', overflowX: 'auto' }}>
                  <div>Model ID: {modelId}</div>
                  <div>GLB URL: {modelData.glbFile}</div>
                  <div>USDZ URL: {modelData.usdzFile}</div>
                  <Button 
                    size="sm" 
                    variant="outline-light" 
                    onClick={() => window.open(modelData.glbFile, '_blank')}
                    className="mt-1 me-1"
                  >
                    Test GLB Link
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline-light" 
                    onClick={() => window.open(modelData.usdzFile, '_blank')}
                    className="mt-1"
                  >
                    Test USDZ Link
                  </Button>
                </div>
              )}
              <Button
                variant="secondary"
                size="sm"
                style={{ position: 'absolute', top: 10, right: 10, zIndex: 10, opacity: 0.7 }}
                onClick={toggleDebugMode}
              >
                {debugMode ? 'Hide Debug' : 'Show Debug'}
              </Button>
              <model-viewer
                src={modelData.glbFile}
                ios-src={modelData.usdzFile}
                poster={modelData.posterImage || ''}
                alt="3D Model"
                ar
                ar-modes="webxr scene-viewer quick-look"
                camera-controls
                auto-rotate
                shadow-intensity="1"
                environment-image="neutral"
                exposure="1"
                style={{ width: '100%', height: '100%', minHeight: '500px' }}
              >
                <button
                  slot="ar-button"
                  style={{
                    backgroundColor: '#4285f4',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    position: 'absolute',
                    bottom: '16px',
                    right: '16px',
                    padding: '8px 16px',
                    fontWeight: 'bold'
                  }}
                >
                  👋 View in AR
                </button>
                <div className="progress-bar hide" slot="progress-bar">
                  <div className="update-bar"></div>
                </div>
              </model-viewer>
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ModelEmbed; 