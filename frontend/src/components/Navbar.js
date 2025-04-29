import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Container, Navbar as BootstrapNavbar, Nav, Button } from 'react-bootstrap';

const Navbar = () => {
  const { user, logout, isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <BootstrapNavbar variant="dark" expand="lg" className="mb-4" style={{ backgroundColor: '#000000', borderBottom: '1px solid #647881' }}>
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/" style={{ color: '#FFF4E2' }}>
          <i className="bi bi-cube-fill me-2"></i>
          3D Model Platform
        </BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {isAuthenticated && (
              <>
                <Nav.Link as={Link} to="/dashboard" style={{ color: '#FFFFFF' }}>
                  <i className="bi bi-columns-gap me-1"></i> Dashboard
                </Nav.Link>
                <Nav.Link as={Link} to="/requests/new" style={{ color: '#FFFFFF' }}>
                  <i className="bi bi-plus-circle me-1"></i> New Request
                </Nav.Link>
              </>
            )}
            {isAdmin && (
              <>
                <Nav.Link as={Link} to="/admin" style={{ color: '#FFF4E2' }}>
                  <i className="bi bi-shield-lock me-1"></i> Admin Panel
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/users" style={{ color: '#FFF4E2' }}>
                  <i className="bi bi-people me-1"></i> Users
                </Nav.Link>
              </>
            )}
          </Nav>
          <Nav>
            {isAuthenticated ? (
              <>
                <Nav.Item className="d-flex align-items-center me-3" style={{ color: '#FFF4E2' }}>
                  <i className="bi bi-person-circle me-1"></i> Welcome, {user.name}
                </Nav.Item>
                <Button variant="outline-light" onClick={handleLogout} style={{ borderColor: '#647881', color: '#FFF4E2' }}>
                  <i className="bi bi-box-arrow-right me-1"></i> Logout
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" style={{ color: '#FFFFFF' }}>
                  <i className="bi bi-box-arrow-in-right me-1"></i> Login
                </Nav.Link>
                <Nav.Link as={Link} to="/register" style={{ color: '#FFFFFF' }}>
                  <i className="bi bi-person-plus me-1"></i> Register
                </Nav.Link>
              </>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar; 