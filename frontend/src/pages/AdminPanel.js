import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Alert, Form, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { requestService } from '../services/api';
import { format } from 'date-fns';

const AdminPanel = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [fileFilter, setFileFilter] = useState('All');
  const [sort, setSort] = useState('desc');
  const [stats, setStats] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const fetchRequests = useCallback(async () => {
    let isMounted = true;
    
    try {
      setLoading(true);
      setError('');
      
      const response = await requestService.getAllRequests({
        search,
        status: statusFilter,
        fileFilter,
        sort,
        page
      });
      
      if (!isMounted) return;
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to load requests');
      }
      
      setRequests(response.data.data.requests);
      setTotalPages(response.data.data.pagination.pages);
      setStats(response.data.data.stats);
    } catch (error) {
      if (!isMounted) return;
      console.error('Error fetching requests:', error);
      setError(error.message || 'Failed to load requests. Please try again.');
      // Reset data on error
      setRequests([]);
      setStats({});
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  }, [search, statusFilter, fileFilter, sort, page]); // Dependencies for useCallback
  
  useEffect(() => {
    let timeoutId;
    const debounceTime = 500; // 500ms debounce
    
    // Clear any pending timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    // Set new timeout for fetching
    timeoutId = setTimeout(() => {
      fetchRequests();
    }, debounceTime);
    
    // Cleanup function
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [fetchRequests]); // Only depend on the memoized fetchRequests
  
  const handleStatusChange = async (requestId, newStatus) => {
    try {
      setError('');
      await requestService.updateRequestStatus(requestId, newStatus);
      fetchRequests();
    } catch (error) {
      setError('Failed to update status. Please try again.');
    }
  };
  
  const handleSortChange = (e) => {
    const newSort = e.target.value;
    setSort(newSort);
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
  
  // Render loading skeleton
  const renderSkeleton = () => (
    <tr>
      <td colSpan="6" className="text-center p-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </td>
    </tr>
  );
  
  return (
    <Container fluid className="py-4">
      <Card className="shadow-sm" style={{ backgroundColor: '#111111', borderColor: '#647881' }}>
        <Card.Header style={{ backgroundColor: '#000000', borderBottom: '1px solid #647881' }}>
          <h4 className="mb-0" style={{ color: '#FFF4E2' }}>Request Management</h4>
        </Card.Header>
        <Card.Body>
          {/* Stats Row */}
          <Row className="mb-4">
            <Col md={3}>
              <Card style={{ backgroundColor: '#647881', border: 'none' }}>
                <Card.Body>
                  <h6 style={{ color: '#FFF4E2' }}>Total Requests</h6>
                  <h3 style={{ color: '#FFFFFF' }}>{stats.total || 0}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card style={{ backgroundColor: '#8B7355', border: 'none' }}>
                <Card.Body>
                  <h6 style={{ color: '#FFF4E2' }}>Pending</h6>
                  <h3 style={{ color: '#FFFFFF' }}>{stats.pending || 0}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card style={{ backgroundColor: '#4F94CD', border: 'none' }}>
                <Card.Body>
                  <h6 style={{ color: '#FFF4E2' }}>In Progress</h6>
                  <h3 style={{ color: '#FFFFFF' }}>{stats.inProgress || 0}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card style={{ backgroundColor: '#2E8B57', border: 'none' }}>
                <Card.Body>
                  <h6 style={{ color: '#FFF4E2' }}>Completed</h6>
                  <h3 style={{ color: '#FFFFFF' }}>{stats.completed || 0}</h3>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          {/* Search and Filter Controls */}
          <Row className="mb-4 g-3">
            <Col md={3}>
              <Form.Control
                type="search"
                placeholder="Search requests..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ 
                  backgroundColor: '#222222',
                  color: '#FFFFFF',
                  borderColor: '#647881'
                }}
              />
            </Col>
            <Col md={2}>
              <Form.Select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ 
                  backgroundColor: '#222222',
                  color: '#FFFFFF',
                  borderColor: '#647881'
                }}
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Rejected">Rejected</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select 
                value={fileFilter} 
                onChange={(e) => setFileFilter(e.target.value)}
                style={{ 
                  backgroundColor: '#222222',
                  color: '#FFFFFF',
                  borderColor: '#647881'
                }}
              >
                <option value="All">All Files</option>
                <option value="Missing Files">Missing Files</option>
                <option value="Only Completed">With Files</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select 
                value={sort} 
                onChange={handleSortChange}
                style={{ 
                  backgroundColor: '#222222',
                  color: '#FFFFFF',
                  borderColor: '#647881'
                }}
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Button 
                variant="outline-primary" 
                onClick={fetchRequests} 
                className="w-100"
                style={{ 
                  borderColor: '#647881',
                  color: '#FFF4E2'
                }}
              >
                Refresh
              </Button>
            </Col>
          </Row>
          
          {/* Requests Table */}
          {error && <Alert variant="danger">{error}</Alert>}
          
          <div className="table-responsive">
            <Table hover variant="dark" style={{ backgroundColor: '#111111' }}>
              <thead style={{ backgroundColor: '#000000' }}>
                <tr>
                  <th style={{ color: '#FFF4E2', borderColor: '#647881' }}>Title</th>
                  <th style={{ color: '#FFF4E2', borderColor: '#647881' }}>User</th>
                  <th style={{ color: '#FFF4E2', borderColor: '#647881' }}>Status</th>
                  <th style={{ color: '#FFF4E2', borderColor: '#647881' }}>Files</th>
                  <th style={{ color: '#FFF4E2', borderColor: '#647881' }}>Date</th>
                  <th style={{ color: '#FFF4E2', borderColor: '#647881' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  renderSkeleton()
                ) : (
                  requests.map((request) => (
                    <tr key={request._id} style={{ borderColor: '#647881' }}>
                      <td style={{ color: '#FFFFFF' }}>{request.title}</td>
                      <td style={{ color: '#FFFFFF' }}>{request.user.name}</td>
                      <td>{renderStatusBadge(request.status)}</td>
                      <td>
                        {request.model ? (
                          <Badge bg="success">Uploaded</Badge>
                        ) : (
                          <Badge bg="warning" text="dark">Pending</Badge>
                        )}
                      </td>
                      <td style={{ color: '#FFFFFF' }}>
                        {format(new Date(request.createdAt), 'MMM d, yyyy HH:mm:ss')}
                      </td>
                      <td>
                        <Button
                          as={Link}
                          to={`/admin/requests/${request._id}`}
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          style={{ 
                            borderColor: '#647881',
                            color: '#FFF4E2'
                          }}
                        >
                          View
                        </Button>
                        {!request.model && (
                          <Button
                            as={Link}
                            to={`/admin/upload/${request._id}`}
                            variant="outline-success"
                            size="sm"
                            style={{ 
                              borderColor: '#2E8B57',
                              color: '#FFF4E2'
                            }}
                          >
                            Upload
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Button
                variant="outline-primary"
                className="me-2"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                style={{ 
                  borderColor: '#647881',
                  color: '#FFF4E2'
                }}
              >
                Previous
              </Button>
              <Button
                variant="outline-primary"
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                style={{ 
                  borderColor: '#647881',
                  color: '#FFF4E2'
                }}
              >
                Next
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminPanel; 