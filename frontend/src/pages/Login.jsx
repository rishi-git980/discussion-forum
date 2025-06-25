import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      const response = await login(formData.email, formData.password);
      
      // Check if user is banned (this should never happen due to backend check, but just in case)
      if (response.user.isBanned) {
        let banMessage = 'Your account has been banned.';
        if (response.user.banReason) {
          banMessage += ` Reason: ${response.user.banReason}`;
        }
        if (response.user.banExpiresAt) {
          banMessage += ` Ban expires: ${new Date(response.user.banExpiresAt).toLocaleDateString()}`;
        }
        setError(banMessage);
        return;
      }

      navigate(response.user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to sign in. Please check your credentials.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 py-5">
      <div className="w-100" style={{ maxWidth: '400px' }}>
        <Card className="shadow-lg border-0">
          <Card.Body className="p-4">
            <h2 className="text-center mb-4">Sign In</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <div className="input-group">
                  <span className="input-group-text">
                    <FontAwesomeIcon icon={faEnvelope} />
                  </span>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter email"
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <div className="input-group">
                  <span className="input-group-text">
                    <FontAwesomeIcon icon={faLock} />
                  </span>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Enter password"
                  />
                  <Button 
                    variant="outline-secondary"
                    onClick={togglePasswordVisibility}
                    type="button"
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </Button>
                </div>
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                disabled={loading}
                className="w-100 py-3 mb-4 fw-bold fs-5"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>

              <div className="text-center fs-5">
                Don't have an account? <Link to="/register" className="text-decoration-none">Register</Link>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default Login; 