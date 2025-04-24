import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      
      // Call the login function from auth context
      await login(email, password);
      
      // Redirect to dashboard on success
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to log in. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow-sm border-0" style={{ backgroundColor: '#111111', borderColor: '#333333' }}>
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <i className="bi bi-person-circle" style={{ fontSize: '3rem', color: '#647881' }}></i>
                <h2 className="mt-3" style={{ color: '#FFF4E2' }}>Log In</h2>
                <p style={{ color: '#FFFFFF' }}>Access your 3D model dashboard</p>
              </div>

              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formEmail">
                  <Form.Label style={{ color: '#FFF4E2' }}>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ backgroundColor: '#222222', color: '#FFFFFF', borderColor: '#333333' }}
                  />
                </Form.Group>
                
                <Form.Group className="mb-4" controlId="formPassword">
                  <Form.Label style={{ color: '#FFF4E2' }}>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ backgroundColor: '#222222', color: '#FFFFFF', borderColor: '#333333' }}
                  />
                </Form.Group>
                
                <div className="d-grid gap-2">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    size="lg"
                    disabled={loading}
                    style={{ backgroundColor: '#647881', borderColor: '#647881' }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Logging in...
                      </>
                    ) : (
                      'Log In'
                    )}
                  </Button>
                </div>
              </Form>
              
              <div className="text-center mt-4">
                <p style={{ color: '#FFFFFF' }}>
                  Don't have an account? <Link to="/register" style={{ color: '#647881', textDecoration: 'none' }}>Register</Link>
                </p>
                <div className="mt-3">
                  <small style={{ color: '#FFF4E2' }}>
                    For testing, you can use:<br />
                    Admin: admin@example.com / password123<br />
                    User: user@example.com / password123
                  </small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login; 