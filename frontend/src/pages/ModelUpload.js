import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { requestService, modelService } from '../services/api';

const ModelUpload = () => {
  const [request, setRequest] = useState(null);
  const [files, setFiles] = useState({
    glbFile: null,
    usdzFile: null,
    posterImage: null
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { requestId } = useParams();
  const navigate = useNavigate();
  
  // Load request details
  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const response = await requestService.getRequestById(requestId);
        setRequest(response.data);
        setLoading(false);
      } catch (error) {
        setError('Failed to load request details. Please try again.');
        setLoading(false);
      }
    };
    
    fetchRequest();
  }, [requestId]);
  
  const handleFileChange = (e) => {
    setFiles({
      ...files,
      [e.target.name]: e.target.files[0]
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required files
    if (!files.glbFile || !files.usdzFile) {
      setError('Please upload both GLB and USDZ files.');
      return;
    }
    
    try {
      setUploading(true);
      setError('');
      
      // Create FormData object
      const formData = new FormData();
      formData.append('glbFile', files.glbFile);
      formData.append('usdzFile', files.usdzFile);
      if (files.posterImage) {
        formData.append('posterImage', files.posterImage);
      }
      
      // Upload files
      await modelService.uploadModel(requestId, formData);
      
      setSuccess(true);
      
      // Redirect after a delay
      setTimeout(() => {
        navigate('/admin');
      }, 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to upload model files. Please try again.');
    } finally {
      setUploading(false);
    }
  };
  
  if (loading) {
    return (
      <Container>
        <Row className="justify-content-center mt-5">
          <Col className="text-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-2">Loading request details...</p>
          </Col>
        </Row>
      </Container>
    );
  }
  
  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h1>Upload 3D Model</h1>
          <p>Upload model files for request: <strong>{request?.title}</strong></p>
        </Col>
      </Row>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && (
        <Alert variant="success">
          Model files uploaded successfully! The request has been marked as completed.
          Redirecting to admin panel...
        </Alert>
      )}
      
      <Row>
        <Col md={8}>
          <Card>
            <Card.Body>
              <Card.Title>Request Details</Card.Title>
              <dl className="row">
                <dt className="col-sm-3">Requester</dt>
                <dd className="col-sm-9">{request?.user?.name || 'Unknown'}</dd>
                
                <dt className="col-sm-3">Description</dt>
                <dd className="col-sm-9">{request?.description}</dd>
                
                <dt className="col-sm-3">Specifications</dt>
                <dd className="col-sm-9">{request?.specifications}</dd>
                
                {request?.additionalNotes && (
                  <>
                    <dt className="col-sm-3">Additional Notes</dt>
                    <dd className="col-sm-9">{request.additionalNotes}</dd>
                  </>
                )}
                
                <dt className="col-sm-3">Status</dt>
                <dd className="col-sm-9">{request?.status}</dd>
              </dl>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Upload Model Files</Card.Title>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>GLB File (Required)</Form.Label>
                  <Form.Control
                    type="file"
                    name="glbFile"
                    accept=".glb"
                    onChange={handleFileChange}
                    required
                    disabled={uploading || success}
                  />
                  <Form.Text className="text-muted">
                    Upload a GLB format 3D model file.
                  </Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>USDZ File (Required)</Form.Label>
                  <Form.Control
                    type="file"
                    name="usdzFile"
                    accept=".usdz"
                    onChange={handleFileChange}
                    required
                    disabled={uploading || success}
                  />
                  <Form.Text className="text-muted">
                    Upload a USDZ format file for AR on iOS devices.
                  </Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Poster Image (Optional)</Form.Label>
                  <Form.Control
                    type="file"
                    name="posterImage"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={uploading || success}
                  />
                  <Form.Text className="text-muted">
                    Upload a poster image to display before the 3D model loads.
                  </Form.Text>
                </Form.Group>
                
                <div className="d-grid gap-2">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={uploading || success || !files.glbFile || !files.usdzFile}
                  >
                    {uploading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                        />{' '}
                        Uploading...
                      </>
                    ) : (
                      'Upload Files'
                    )}
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate('/admin')}
                    disabled={uploading}
                  >
                    Cancel
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ModelUpload; 