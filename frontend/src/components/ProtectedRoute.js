import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner, Container, Row, Col } from 'react-bootstrap';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  
  // Show loading spinner while auth state is being determined
  if (loading) {
    return (
      <Container>
        <Row className="justify-content-center mt-5">
          <Col className="text-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-2">Checking authentication...</p>
          </Col>
        </Row>
      </Container>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Render the protected component
  return <Outlet />;
};

export default ProtectedRoute; 