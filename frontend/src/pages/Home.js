import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div>
      {/* Hero Section */}
      <div style={{ backgroundColor: '#000000', borderBottom: '1px solid #647881' }} className="py-5">
        <Container>
          <Row className="align-items-center">
            <Col md={6}>
              <h1 className="display-4 fw-bold" style={{ color: '#FFF4E2' }}>3D Model Request Platform</h1>
              <p className="lead my-4" style={{ color: '#FFFFFF' }}>
                Submit requests for 3D models and get embed codes with AR functionality for your website.
                Our platform makes it easy to manage 3D content across your digital properties.
              </p>
              {isAuthenticated ? (
                <Button 
                  as={Link} 
                  to="/dashboard" 
                  size="lg" 
                  className="me-3"
                  style={{ backgroundColor: '#647881', borderColor: '#647881' }}
                >
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button 
                    as={Link} 
                    to="/register" 
                    size="lg" 
                    className="me-3"
                    style={{ backgroundColor: '#647881', borderColor: '#647881', color: '#FFFFFF' }}
                  >
                    Sign Up
                  </Button>
                  <Button 
                    as={Link} 
                    to="/login" 
                    variant="outline-light" 
                    size="lg"
                    style={{ borderColor: '#647881', color: '#FFF4E2' }}
                  >
                    Login
                  </Button>
                </>
              )}
            </Col>
            <Col md={6} className="text-center">
              <img 
                src="https://cdn.pixabay.com/photo/2018/05/18/15/30/webdesign-3411373_1280.jpg" 
                alt="3D model illustration" 
                className="img-fluid rounded"
                style={{ border: '2px solid #647881' }}
              />
            </Col>
          </Row>
        </Container>
      </div>
      
      {/* Features Section */}
      <Container className="py-5">
        <h2 className="text-center mb-5" style={{ color: '#FFF4E2' }}>How It Works</h2>
        <Row>
          <Col md={4} className="mb-4">
            <Card className="h-100" style={{ backgroundColor: '#111111', borderColor: '#647881' }}>
              <Card.Body className="text-center">
                <div className="mb-3">
                  <i className="bi bi-pencil-square" style={{ fontSize: '3rem', color: '#647881' }}></i>
                </div>
                <Card.Title style={{ color: '#FFF4E2' }}>1. Submit a Request</Card.Title>
                <Card.Text style={{ color: '#FFFFFF' }}>
                  Create a detailed request for the 3D model you need, including specifications and requirements.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="h-100" style={{ backgroundColor: '#111111', borderColor: '#647881' }}>
              <Card.Body className="text-center">
                <div className="mb-3">
                  <i className="bi bi-hourglass-split" style={{ fontSize: '3rem', color: '#647881' }}></i>
                </div>
                <Card.Title style={{ color: '#FFF4E2' }}>2. Get Your Model</Card.Title>
                <Card.Text style={{ color: '#FFFFFF' }}>
                  Our team will create your 3D model based on your specifications and upload it to the platform.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="h-100" style={{ backgroundColor: '#111111', borderColor: '#647881' }}>
              <Card.Body className="text-center">
                <div className="mb-3">
                  <i className="bi bi-code-square" style={{ fontSize: '3rem', color: '#647881' }}></i>
                </div>
                <Card.Title style={{ color: '#FFF4E2' }}>3. Embed on Your Website</Card.Title>
                <Card.Text style={{ color: '#FFFFFF' }}>
                  Copy the generated embed code to add your 3D model with AR capabilities to your website.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      
      {/* Call to Action */}
      <div style={{ backgroundColor: '#000000', borderTop: '1px solid #647881' }} className="py-5">
        <Container className="text-center">
          <h2 style={{ color: '#FFF4E2' }}>Ready to Get Started?</h2>
          <p className="lead mb-4" style={{ color: '#FFFFFF' }}>
            Join now and start submitting your 3D model requests
          </p>
          {isAuthenticated ? (
            <Button 
              as={Link} 
              to="/requests/new" 
              size="lg"
              style={{ backgroundColor: '#647881', borderColor: '#647881' }}
            >
              Submit Your First Request
            </Button>
          ) : (
            <Button 
              as={Link} 
              to="/register" 
              size="lg"
              style={{ backgroundColor: '#647881', borderColor: '#647881' }}
            >
              Create an Account
            </Button>
          )}
        </Container>
      </div>
    </div>
  );
};

export default Home; 