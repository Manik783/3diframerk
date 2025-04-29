import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      
      const { email, password } = formData;
      const result = await login(email, password);
      
      console.log('Login successful:', result);
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to login');
      }
      
      // Navigate based on user role
      if (result.user.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to login. Please check your credentials.');
    } finally {
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
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={{ backgroundColor: '#222222', color: '#FFFFFF', borderColor: '#333333' }}
                  />
                </Form.Group>
                
                <Form.Group className="mb-4" controlId="formPassword">
                  <Form.Label style={{ color: '#FFF4E2' }}>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
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
                    Test User: test@example.com / password123
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