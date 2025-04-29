import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Form, Button, Modal, Badge, Spinner, Alert } from 'react-bootstrap';
import { format } from 'date-fns';
import axios from '../services/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('desc');
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  
  // Fetch users with search and filter
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/users/all?search=${search}&filter=${filter}&sort=${sort}`);
      setUsers(response.data);
      setError('');
    } catch (error) {
      setError('Failed to load users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch user details for modal
  const fetchUserDetails = async (userId) => {
    try {
      const response = await axios.get(`/api/users/${userId}`);
      setUserDetails(response.data);
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };
  
  useEffect(() => {
    fetchUsers();
  }, [search, filter, sort]);
  
  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
    fetchUserDetails(user._id);
  };
  
  // Render loading skeleton
  const renderSkeleton = () => (
    <tr>
      <td colSpan="5" className="text-center p-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </td>
    </tr>
  );
  
  return (
    <Container fluid className="py-4">
      <Card className="shadow-sm">
        <Card.Header className="bg-dark text-white">
          <h4 className="mb-0">User Management</h4>
        </Card.Header>
        <Card.Body>
          {/* Search and Filter Controls */}
          <Row className="mb-4 g-3">
            <Col md={4}>
              <Form.Control
                type="search"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Col>
            <Col md={3}>
              <Form.Select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="all">All Users</option>
                <option value="no-requests">Users with No Requests</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Button variant="primary" onClick={fetchUsers} className="w-100">
                Refresh
              </Button>
            </Col>
          </Row>
          
          {/* Users Table */}
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Table responsive striped hover>
            <thead className="bg-light">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Requests</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                renderSkeleton()
              ) : (
                users.map((user, index) => (
                  <tr key={user._id} className={index % 2 === 0 ? 'bg-light' : ''}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <Badge bg={user.requestCount > 0 ? 'info' : 'secondary'}>
                        {user.requestCount}
                      </Badge>
                    </td>
                    <td>{format(new Date(user.createdAt), 'MMM d, yyyy')}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleViewDetails(user)}
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
      
      {/* User Details Modal */}
      <Modal
        show={showUserModal}
        onHide={() => setShowUserModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton className="bg-dark text-white">
          <Modal.Title>User Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && userDetails ? (
            <>
              <Row className="mb-4">
                <Col md={6}>
                  <h5>Profile Information</h5>
                  <p><strong>Name:</strong> {selectedUser.name}</p>
                  <p><strong>Email:</strong> {selectedUser.email}</p>
                  <p><strong>Status:</strong> <Badge bg="success">Active</Badge></p>
                  <p><strong>Joined:</strong> {format(new Date(selectedUser.createdAt), 'MMM d, yyyy')}</p>
                </Col>
                <Col md={6}>
                  <h5>Statistics</h5>
                  <p><strong>Total Requests:</strong> {userDetails.user.requestCount}</p>
                </Col>
              </Row>
              
              <h5>Request History</h5>
              <Table responsive striped>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {userDetails.requests.map((request) => (
                    <tr key={request._id}>
                      <td>{request.title}</td>
                      <td>
                        <Badge bg={
                          request.status === 'Pending' ? 'warning' :
                          request.status === 'In Progress' ? 'info' :
                          request.status === 'Completed' ? 'success' :
                          'secondary'
                        }>
                          {request.status}
                        </Badge>
                      </td>
                      <td>{format(new Date(request.createdAt), 'MMM d, yyyy')}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          ) : (
            <div className="text-center p-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUserModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminUsers; 