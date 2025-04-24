import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Alert, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { requestService } from '../services/api';

const AdminPanel = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  useEffect(() => {
    fetchAllRequests();
  }, []);
  
  const fetchAllRequests = async () => {
    try {
      setLoading(true);
      const response = await requestService.getAllRequests();
      setRequests(response.data);
      setError('');
    } catch (error) {
      setError('Failed to load requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleStatusChange = async (requestId, newStatus) => {
    try {
      await requestService.updateRequestStatus(requestId, newStatus);
      
      // Update local state
      setRequests(requests.map(request => 
        request._id === requestId 
          ? { ...request, status: newStatus } 
          : request
      ));
      
    } catch (error) {
      setError('Failed to update status. Please try again.');
    }
  };
  
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
  
  // Filter requests based on status
  const filteredRequests = statusFilter === 'all' 
    ? requests 
    : requests.filter(request => request.status === statusFilter);
  
  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h1 style={{ color: '#FFF4E2' }}>Admin Panel</h1>
          <p style={{ color: '#FFFFFF' }}>Manage 3D model requests</p>
        </Col>
      </Row>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label style={{ color: '#FFF4E2' }}>Filter by Status</Form.Label>
            <Form.Select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ backgroundColor: '#222222', color: '#FFFFFF', borderColor: '#333333' }}
            >
              <option value="all">All Requests</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Rejected">Rejected</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6} className="d-flex align-items-end justify-content-end">
          <Button variant="primary" onClick={fetchAllRequests}>
            Refresh
          </Button>
        </Col>
      </Row>
      
      <Row>
        <Col>
          <Card>
            <Card.Body>
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3" style={{ color: '#FFF4E2' }}>Loading requests...</p>
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="text-center py-5">
                  <p style={{ color: '#FFF4E2' }}>No requests found with the selected filter.</p>
                </div>
              ) : (
                <Table responsive hover variant="dark">
                  <thead>
                    <tr>
                      <th style={{ color: '#FFF4E2' }}>ID</th>
                      <th style={{ color: '#FFF4E2' }}>User</th>
                      <th style={{ color: '#FFF4E2' }}>Title</th>
                      <th style={{ color: '#FFF4E2' }}>Status</th>
                      <th style={{ color: '#FFF4E2' }}>Date</th>
                      <th style={{ color: '#FFF4E2' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((request) => (
                      <tr key={request._id}>
                        <td style={{ color: '#FFFFFF' }}>{request._id.substring(0, 8)}...</td>
                        <td style={{ color: '#FFFFFF' }}>{request.user?.name || 'Unknown'}</td>
                        <td style={{ color: '#FFFFFF' }}>{request.title}</td>
                        <td>{renderStatusBadge(request.status)}</td>
                        <td style={{ color: '#FFFFFF' }}>{formatDate(request.createdAt)}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              as={Link}
                              to={`/admin/requests/${request._id}`}
                              variant="outline-primary"
                              size="sm"
                              style={{ borderColor: '#647881', color: '#FFF4E2' }}
                            >
                              View
                            </Button>
                            
                            {request.status !== 'Completed' && (
                              <Form.Select
                                size="sm"
                                className="w-auto"
                                value={request.status}
                                onChange={(e) => handleStatusChange(request._id, e.target.value)}
                                style={{ backgroundColor: '#222222', color: '#FFFFFF', borderColor: '#333333' }}
                              >
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                                <option value="Rejected">Rejected</option>
                              </Form.Select>
                            )}
                            
                            {request.status !== 'Completed' && (
                              <Button
                                as={Link}
                                to={`/admin/upload/${request._id}`}
                                variant="success"
                                size="sm"
                              >
                                Upload Model
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminPanel; 