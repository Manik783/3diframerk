import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { modelService } from '../services/api';

const ModelEmbed = () => {
  const [modelData, setModelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { modelId } = useParams();
  
  useEffect(() => {
    const loadModelViewerScript = () => {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';
      document.head.appendChild(script);
    };
    
    const fetchModelData = async () => {
      try {
        const response = await modelService.getPublicModelData(modelId);
        setModelData(response.data);
        setLoading(false);
      } catch (error) {
        setError('Failed to load 3D model. Please try again later.');
        setLoading(false);
      }
    };
    
    // Load the model-viewer script
    loadModelViewerScript();
    // Fetch model data
    fetchModelData();
  }, [modelId]);
  
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
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ModelEmbed; 