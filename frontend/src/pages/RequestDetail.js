import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Alert, Spinner } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { requestService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const RequestDetail = () => {
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  useEffect(() => {
    const fetchRequestDetails = async () => {
      try {
        const response = await requestService.getRequestById(requestId);
        setRequest(response.data);
        console.log('Request data:', response.data);
        if (response.data && response.data.model) {
          console.log('Model ID from request:', response.data.model);
        }
        setLoading(false);
      } catch (error) {
        setError('Failed to load request details. Please try again.');
        setLoading(false);
      }
    };
    
    fetchRequestDetails();
  }, [requestId]);
  
  // Helper to render status badge with appropriate color
  const renderStatusBadge = (status) => {
    let variant;
    
    switch (status) {
      case 'Pending':
        variant = 'warning';
        break;
      case 'In Progress':
        variant = 'info';
        break;
      case 'Completed':
        variant = 'success';
        break;
      case 'Rejected':
        variant = 'danger';
        break;
      default:
        variant = 'secondary';
    }
    
    return <Badge bg={variant}>{status}</Badge>;
  };
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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
      <Row className="mb-4 align-items-center">
        <Col>
          <h1>Request Details</h1>
        </Col>
        <Col className="text-end">
          <Button
            variant="outline-secondary"
            onClick={() => navigate(isAdmin ? '/admin' : '/dashboard')}
          >
            Back to {isAdmin ? 'Admin Panel' : 'Dashboard'}
          </Button>
        </Col>
      </Row>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {request && (
        <Row>
          <Col>
            <Card className="mb-4">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0">{request.title}</h4>
                {renderStatusBadge(request.status)}
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={8}>
                    <h5 className="mb-3">Details</h5>
                    <dl className="row">
                      <dt className="col-sm-3">Submitted</dt>
                      <dd className="col-sm-9">{formatDate(request.createdAt)}</dd>
                      
                      <dt className="col-sm-3">Description</dt>
                      <dd className="col-sm-9">{request.description}</dd>
                      
                      <dt className="col-sm-3">Specifications</dt>
                      <dd className="col-sm-9">{request.specifications}</dd>
                      
                      {request.additionalNotes && (
                        <>
                          <dt className="col-sm-3">Additional Notes</dt>
                          <dd className="col-sm-9">{request.additionalNotes}</dd>
                        </>
                      )}
                    </dl>
                  </Col>
                  
                  <Col md={4}>
                    <Card className="bg-light">
                      <Card.Body>
                        <h5 className="mb-3">Status Information</h5>
                        <p className="mb-2">
                          <strong>Current Status:</strong> {request.status}
                        </p>
                        <p className="mb-3">
                          <strong>Last Updated:</strong> {formatDate(request.updatedAt)}
                        </p>
                        
                        {request.status === 'Completed' ? (
                          <div className="d-grid">
                            {console.log('Model ID type:', typeof request.model, 'Value:', request.model)}
                            <Button
                              as={Link}
                              to={`/models/${request.model && typeof request.model === 'object' ? request.model._id : request.model}`}
                              variant="success"
                              className="mb-2"
                            >
                              Get Embed Code
                            </Button>
                            <p>
                              <small className="text-muted">Model ID: {request.model && typeof request.model === 'object' ? request.model._id : request.model}</small>
                            </p>
                          </div>
                        ) : isAdmin && request.status !== 'Completed' ? (
                          <div className="d-grid">
                            <Button
                              as={Link}
                              to={`/admin/upload/${request._id}`}
                              variant="primary"
                            >
                              Upload Model Files
                            </Button>
                          </div>
                        ) : (
                          <p className="text-muted">
                            {request.status === 'Rejected' 
                              ? 'This request has been rejected.'
                              : 'Your request is being processed. You will be notified when it is complete.'}
                          </p>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default RequestDetail; 