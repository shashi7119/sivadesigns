// Login.js:
import React, { useState} from 'react';
import { Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 4) newErrors.password = 'Password must be at least 6 characters';
    return newErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
    } else {      
      // Here you would typically send a request to your server
      try {
        setErrors({});
        setIsSubmitting(true);
        await login(email, password);
        navigate('/');
      } catch (error) {   
        const backendMessage = error?.response?.data?.message || error?.response?.data?.error || 'Login failed. Please try again.';
        setErrors((prev) => ({ ...prev, form: backendMessage }));
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-form-container">
          <h2 className="text-center mb-4">Login</h2>
         
          <Form onSubmit={handleSubmit}>
            {errors.form && (
              <div className="text-danger mb-3">{errors.form}</div>
            )}
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                isInvalid={!!errors.email}
              />
              <Form.Control.Feedback type="invalid">
              {errors.email}
             </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                isInvalid={!!errors.password}
              />
              <Form.Control.Feedback type="invalid">
              {errors.password}
            </Form.Control.Feedback>
            </Form.Group>

            <Button variant="primary" type="submit" className="login-button">
              {isSubmitting ? 'Logging in...' : 'Login'}
            </Button>
          </Form>
    
       </div>
    </div>
  );
}

export default Login;