import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Form, InputGroup } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { modelService } from '../services/api';

const EmbedCode = () => {
  const [model, setModel] = useState(null);
  const [embedCode, setEmbedCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  
  const { modelId } = useParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchModelDetails = async () => {
      try {
        console.log('Fetching model with ID:', modelId);
        
        // Make sure we have a valid model ID string
        const actualModelId = typeof modelId === 'object' ? modelId._id : modelId;
        
        if (!actualModelId || actualModelId === '[object Object]') {
          console.error('Invalid model ID:', modelId);
          setError('Invalid model ID. Please go back to the dashboard and try again.');
          setLoading(false);
          return;
        }
        
        // First get model details
        const modelResponse = await modelService.getModelById(actualModelId);
        setModel(modelResponse.data);
        
        // Then get the embed code
        const embedResponse = await modelService.getEmbedCode(actualModelId);
        setEmbedCode(embedResponse.data.embedCode);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching model details:', error);
        setError(
          error.response?.status === 404
            ? 'Model not found. It may have been deleted.'
            : 'Failed to load model details or embed code. Please try again.'
        );
        setLoading(false);
      }
    };
    
    fetchModelDetails();
  }, [modelId]);
  
  const handleCopyCode = () => {
    navigator.clipboard.writeText(embedCode)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      })
      .catch(() => {
        setError('Failed to copy embed code to clipboard. Please try manually selecting and copying the code.');
      });
  };
  
  if (loading) {
    return (
      <Container>
        <Row className="justify-content-center mt-5">
          <Col className="text-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-2">Loading embed code...</p>
          </Col>
        </Row>
      </Container>
    );
  }
  
  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h1>3D Model Embed Code</h1>
          <p>Copy this code to embed your 3D model on your website</p>
        </Col>
      </Row>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {copied && <Alert variant="success">Embed code copied to clipboard!</Alert>}
      
      <Row>
        <Col md={8}>
          <Card>
            <Card.Body>
              <Card.Title>Your Embed Code</Card.Title>
              <p className="text-muted mb-3">
                Copy and paste this code into your website's HTML to display your 3D model with AR capabilities.
                The iframe will load our model viewer with your 3D model already configured.
              </p>
              
              <Form.Group className="mb-3">
                <InputGroup>
                  <Form.Control
                    as="textarea"
                    rows={6}
                    value={embedCode}
                    readOnly
                    className="font-monospace"
                  />
                  <Button 
                    variant="outline-primary"
                    onClick={handleCopyCode}
                  >
                    Copy
                  </Button>
                </InputGroup>
                {embedCode && (
                  <div className="mt-2">
                    <Alert variant="info">
                      <strong>Preview:</strong> The code will create an iframe that loads your 3D model.
                    </Alert>
                  </div>
                )}
              </Form.Group>
              
              <h5 className="mt-4">How to Use</h5>
              <ol>
                <li>Copy the embed code above</li>
                <li>Paste it into your website's HTML where you want the 3D model to appear</li>
                <li>
                  The iframe will load our specialized 3D model viewer with your model pre-configured
                </li>
                <li>Users on compatible devices will be able to view the model in AR by clicking the AR button</li>
                <li>The model is served from our high-speed CloudFront CDN for optimal performance</li>
              </ol>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Request Details</Card.Title>
              <dl>
                <dt>Title</dt>
                <dd>{model?.request?.title || 'Unknown'}</dd>
                
                <dt>Status</dt>
                <dd className="text-success">Completed</dd>
                
                <dt>Model Files</dt>
                <dd>
                  <ul className="list-unstyled">
                    <li>GLB File ✓</li>
                    <li>USDZ File ✓</li>
                    {model?.posterImage && <li>Poster Image ✓</li>}
                  </ul>
                </dd>
              </dl>
              
              <div className="d-grid gap-2 mt-4">
                <Button
                  variant="primary"
                  onClick={() => {
                    const baseUrl = 'https://threediframerk.onrender.com';
                    window.open(`${baseUrl}/embed/${modelId}`, '_blank');
                  }}
                >
                  Preview Embed
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={() => navigate('/dashboard')}
                >
                  Back to Dashboard
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EmbedCode; 