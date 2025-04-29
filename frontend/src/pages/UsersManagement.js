import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Alert, Form, Modal, Spinner } from 'react-bootstrap';
import { format } from 'date-fns';
import { userService } from '../services/api';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers({
        search,
        filter,
        sort,
        page
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to load users');
      }

      setUsers(response.data.data.users);
      setTotalPages(response.data.data.pagination.pages);
      setError('');
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.message || 'Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, filter, sort, page]);

  const fetchUserDetails = async (userId) => {
    try {
      setLoadingDetails(true);
      const response = await userService.getUserDetails(userId);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to load user details');
      }

      setUserDetails(response.data.data);
    } catch (error) {
      console.error('Error fetching user details:', error);
      setError(error.message || 'Failed to load user details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowModal(true);
    fetchUserDetails(user._id);
  };

  const renderRoleBadge = (isAdmin) => (
    <Badge bg={isAdmin ? 'danger' : 'info'}>
      {isAdmin ? 'Admin' : 'User'}
    </Badge>
  );

  const renderRequestCountBadge = (count) => (
    <Badge bg={count > 0 ? 'success' : 'warning'}>
      {count}
    </Badge>
  );

  return (
    <Container fluid className="py-4">
      <Card className="shadow-sm" style={{ backgroundColor: '#111111', borderColor: '#647881' }}>
        <Card.Header style={{ backgroundColor: '#000000', borderBottom: '1px solid #647881' }}>
          <h4 className="mb-0" style={{ color: '#FFF4E2' }}>Users Management</h4>
        </Card.Header>
        <Card.Body>
          {/* Search and Filter Controls */}
          <Row className="mb-4 g-3">
            <Col md={4}>
              <Form.Control
                type="search"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ 
                  backgroundColor: '#222222',
                  color: '#FFFFFF',
                  borderColor: '#647881'
                }}
              />
            </Col>
            <Col md={3}>
              <Form.Select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{ 
                  backgroundColor: '#222222',
                  color: '#FFFFFF',
                  borderColor: '#647881'
                }}
              >
                <option value="all">All Users</option>
                <option value="with_requests">With Requests</option>
                <option value="no_requests">No Requests</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select 
                value={sort}
                onChange={(e) => setSort(e.target.value)}
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
                onClick={fetchUsers}
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

          {/* Users Table */}
          {error && <Alert variant="danger">{error}</Alert>}
          
          <div className="table-responsive">
            <Table hover variant="dark" style={{ backgroundColor: '#111111' }}>
              <thead style={{ backgroundColor: '#000000' }}>
                <tr>
                  <th style={{ color: '#FFF4E2', borderColor: '#647881' }}>Name</th>
                  <th style={{ color: '#FFF4E2', borderColor: '#647881' }}>Email</th>
                  <th style={{ color: '#FFF4E2', borderColor: '#647881' }}>Role</th>
                  <th style={{ color: '#FFF4E2', borderColor: '#647881' }}>Requests</th>
                  <th style={{ color: '#FFF4E2', borderColor: '#647881' }}>Signup Date</th>
                  <th style={{ color: '#FFF4E2', borderColor: '#647881' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center p-5">
                      <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </Spinner>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id} style={{ borderColor: '#647881' }}>
                      <td style={{ color: '#FFFFFF' }}>{user.name}</td>
                      <td style={{ color: '#FFFFFF' }}>{user.email}</td>
                      <td>{renderRoleBadge(user.isAdmin)}</td>
                      <td>{renderRequestCountBadge(user.requestCount)}</td>
                      <td style={{ color: '#FFFFFF' }}>
                        {format(new Date(user.createdAt), 'MMM d, yyyy HH:mm:ss')}
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleViewDetails(user)}
                          style={{ 
                            borderColor: '#647881',
                            color: '#FFF4E2'
                          }}
                        >
                          View Details
                        </Button>
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

      {/* User Details Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
        style={{ color: '#FFFFFF' }}
      >
        <Modal.Header style={{ backgroundColor: '#111111', borderColor: '#647881' }}>
          <Modal.Title style={{ color: '#FFF4E2' }}>
            User Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: '#111111' }}>
          {loadingDetails ? (
            <div className="text-center p-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : userDetails ? (
            <>
              <div className="mb-4">
                <h5 style={{ color: '#FFF4E2' }}>Profile Information</h5>
                <Table variant="dark" style={{ backgroundColor: '#222222' }}>
                  <tbody>
                    <tr>
                      <td style={{ width: '150px', color: '#FFF4E2' }}>Name:</td>
                      <td style={{ color: '#FFFFFF' }}>{userDetails.user.name}</td>
                    </tr>
                    <tr>
                      <td style={{ color: '#FFF4E2' }}>Email:</td>
                      <td style={{ color: '#FFFFFF' }}>{userDetails.user.email}</td>
                    </tr>
                    <tr>
                      <td style={{ color: '#FFF4E2' }}>Role:</td>
                      <td>{renderRoleBadge(userDetails.user.isAdmin)}</td>
                    </tr>
                    <tr>
                      <td style={{ color: '#FFF4E2' }}>Joined:</td>
                      <td style={{ color: '#FFFFFF' }}>
                        {format(new Date(userDetails.user.createdAt), 'MMM d, yyyy HH:mm:ss')}
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </div>

              {userDetails.requests.length > 0 && (
                <div>
                  <h5 style={{ color: '#FFF4E2' }}>Submitted Requests</h5>
                  <Table variant="dark" style={{ backgroundColor: '#222222' }}>
                    <thead>
                      <tr>
                        <th style={{ color: '#FFF4E2' }}>Title</th>
                        <th style={{ color: '#FFF4E2' }}>Status</th>
                        <th style={{ color: '#FFF4E2' }}>Files</th>
                        <th style={{ color: '#FFF4E2' }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userDetails.requests.map((request) => (
                        <tr key={request._id}>
                          <td style={{ color: '#FFFFFF' }}>{request.title}</td>
                          <td>
                            <Badge bg={request.status === 'Completed' ? 'success' : 'warning'}>
                              {request.status}
                            </Badge>
                          </td>
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
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </>
          ) : (
            <Alert variant="danger">Failed to load user details</Alert>
          )}
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: '#111111', borderColor: '#647881' }}>
          <Button 
            variant="outline-secondary" 
            onClick={() => setShowModal(false)}
            style={{ 
              borderColor: '#647881',
              color: '#FFF4E2'
            }}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UsersManagement; 