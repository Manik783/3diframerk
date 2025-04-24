import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { requestService } from '../services/api';

const NewRequest = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    specifications: '',
    additionalNotes: ''
  });
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();
  
  const { title, description, specifications, additionalNotes } = formData;
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    setValidated(true);
    setLoading(true);
    setError('');
    
    try {
      await requestService.createRequest(formData);
      setSuccess(true);
      
      // Reset form after successful submission
      setFormData({
        title: '',
        description: '',
        specifications: '',
        additionalNotes: ''
      });
      
      // Redirect to dashboard after a delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col md={8}>
          <Card>
            <Card.Body>
              <Card.Title className="mb-4">Submit a New 3D Model Request</Card.Title>
              
              {error && <Alert variant="danger">{error}</Alert>}
              {success && (
                <Alert variant="success">
                  Your request has been submitted successfully! Redirecting to dashboard...
                </Alert>
              )}
              
              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="title">
                  <Form.Label>Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={title}
                    onChange={handleChange}
                    required
                    placeholder="Enter a descriptive title for your 3D model request"
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide a title for your request.
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="description">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={description}
                    onChange={handleChange}
                    required
                    placeholder="Describe the 3D model you need"
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide a description.
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="specifications">
                  <Form.Label>Specifications</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="specifications"
                    value={specifications}
                    onChange={handleChange}
                    required
                    placeholder="Specify technical requirements, dimensions, colors, etc."
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide specifications.
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="additionalNotes">
                  <Form.Label>Additional Notes (Optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="additionalNotes"
                    value={additionalNotes}
                    onChange={handleChange}
                    placeholder="Any additional information that might be helpful"
                  />
                </Form.Group>
                
                <div className="d-grid gap-2">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={loading || success}
                  >
                    {loading ? 'Submitting...' : 'Submit Request'}
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate('/dashboard')}
                    disabled={loading || success}
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

export default NewRequest; 