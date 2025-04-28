import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const { name, email, password, confirmPassword } = formData;
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setValidated(true);
    setLoading(true);
    setError('');
    
    try {
      await register({ name, email, password });
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
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
                <i className="bi bi-person-plus-fill" style={{ fontSize: '3rem', color: '#647881' }}></i>
                <h2 className="mt-3" style={{ color: '#FFF4E2' }}>Create an Account</h2>
                <p style={{ color: '#FFFFFF' }}>Sign up to start requesting 3D models</p>
              </div>

              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="name">
                  <Form.Label style={{ color: '#FFF4E2' }}>Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your name"
                    style={{ backgroundColor: '#222222', color: '#FFFFFF', borderColor: '#333333' }}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide your name.
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label style={{ color: '#FFF4E2' }}>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={email}
                    onChange={handleChange}
                    required
                    placeholder="Enter your email"
                    style={{ backgroundColor: '#222222', color: '#FFFFFF', borderColor: '#333333' }}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide a valid email.
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="password">
                  <Form.Label style={{ color: '#FFF4E2' }}>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={password}
                    onChange={handleChange}
                    required
                    minLength="6"
                    placeholder="Enter password"
                    style={{ backgroundColor: '#222222', color: '#FFFFFF', borderColor: '#333333' }}
                  />
                  <Form.Control.Feedback type="invalid">
                    Password must be at least 6 characters.
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="mb-4" controlId="confirmPassword">
                  <Form.Label style={{ color: '#FFF4E2' }}>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="Confirm password"
                    style={{ backgroundColor: '#222222', color: '#FFFFFF', borderColor: '#333333' }}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please confirm your password.
                  </Form.Control.Feedback>
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
                        Registering...
                      </>
                    ) : (
                      'Register'
                    )}
                  </Button>
                </div>
              </Form>
              
              <div className="text-center mt-4">
                <p style={{ color: '#FFFFFF' }}>
                  Already have an account? <Link to="/login" style={{ color: '#647881', textDecoration: 'none' }}>Login</Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;

 