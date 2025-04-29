import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Badge, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { requestService } from '../services/api';
import { format } from 'date-fns';

const Dashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const response = await requestService.getUserRequests();
        
        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to load requests');
        }
        
        setRequests(response.data.data);
        setError('');
      } catch (error) {
        console.error('Error fetching requests:', error);
        setError(error.message || 'Failed to load requests. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRequests();
  }, []);
  
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
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  if (loading) {
    return (
      <Container>
        <Row className="justify-content-center mt-5">
          <Col md={8}>
            <Card>
              <Card.Body className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading your requests...</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }
  
  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h1 style={{ color: '#FFF4E2' }}>Your Dashboard</h1>
          <p style={{ color: '#FFFFFF' }}>Welcome back, {user.name}!</p>
        </Col>
        <Col className="text-end">
          <Button as={Link} to="/requests/new" variant="primary">
            + New 3D Model Request
          </Button>
        </Col>
      </Row>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Row>
        <Col>
          <Card>
            <Card.Header style={{ backgroundColor: '#647881' }}>
              <h4 style={{ color: '#FFFFFF' }}>Your 3D Model Requests</h4>
            </Card.Header>
            <Card.Body>
              {requests.length === 0 ? (
                <div className="text-center py-5">
                  <p style={{ color: '#FFF4E2' }}>You haven't submitted any requests yet.</p>
                  <Button as={Link} to="/requests/new" variant="primary">
                    Submit Your First Request
                  </Button>
                </div>
              ) : (
                requests.map((request) => (
                  <Card key={request._id} className="mb-3">
                    <Card.Body>
                      <Row>
                        <Col>
                          <h5 style={{ color: '#FFF4E2' }}>{request.title}</h5>
                          <p style={{ color: '#FFFFFF' }} className="mb-1">
                            Submitted on {format(new Date(request.createdAt), 'MMM d, yyyy HH:mm:ss')}
                          </p>
                          <div className="mt-2">
                            {renderStatusBadge(request.status)}
                          </div>
                        </Col>
                        <Col md={3} className="text-end d-flex flex-column justify-content-center">
                          <Button
                            as={Link}
                            to={`/requests/${request._id}`}
                            variant="outline-primary"
                            size="sm"
                            className="mb-2"
                            style={{ borderColor: '#647881', color: '#FFF4E2' }}
                          >
                            View Details
                          </Button>
                          
                          {request.status === 'Completed' && request.model && (
                            <div>
                              <Button
                                as={Link}
                                to={`/models/${request.model._id || request.model}`}
                                variant="success"
                                size="sm"
                                className="w-100 mb-2"
                              >
                                <i className="bi bi-code-square me-1"></i> Get Embed Code
                              </Button>
                              <small style={{ color: '#FFF4E2' }} className="d-block text-center">
                                Your 3D model is ready! Click to get the embed code.
                              </small>
                            </div>
                          )}
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                ))
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard; 