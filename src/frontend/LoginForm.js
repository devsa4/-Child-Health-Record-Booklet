import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import { Link,useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUser, FaLock, FaSignInAlt } from 'react-icons/fa';
import { MdSecurity } from 'react-icons/md';
import './LoginForm.css';

function LoginForm() {
  const [nationalId, setNationalId] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!nationalId || !password) {
      alert('Please enter both National ID and password.');
      return;
    }

    try {
      // ✅ Fixed Axios URL to point to correct backend
      const res = await axios.post('http://localhost:5000/login', {
        nationalId: nationalId.trim(),
        password: password.trim(),
      });

      //alert(res.data.message || 'Login successful!');
      console.log('Logged in user:', res.data.user);

      setNationalId('');
      setPassword('');
      navigate('/home');
    } catch (err) {
      console.error('Login error:', err.response || err);
      alert('Login failed: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <>
      <video autoPlay loop muted playsInline className="bg-video">
        <source src="/background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="bg-video-overlay"></div>
      <div className="bg-vignette-bottom"></div>

      <div className="login-wrapper position-absolute top-50 start-50 translate-middle">
        <Card className="login-card text-center">
          <Card.Body>
            <Card.Title className="d-flex align-items-center justify-content-center gap-2 card-title mb-4">
              <MdSecurity style={{ color: '#fff', fontSize: '1.6rem' }} />
              Member Login
            </Card.Title>

            <Form onSubmit={handleLogin}>
              <Form.Group className="mb-3" controlId="formNationalId">
                <div className="input-icon-wrapper">
                  <FaUser className="input-icon" />
                  <Form.Control
                    type="text"
                    placeholder="Your National ID"
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    autoComplete="username"
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formPassword">
                <div className="input-icon-wrapper">
                  <FaLock className="input-icon" />
                  <Form.Control
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </div>
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                className="login-button d-flex align-items-center justify-content-center gap-2"
              >
                <FaSignInAlt />
                Login
              </Button>
            </Form>

            <p className="signup-text mt-3">
              Don’t have an account? <Link to="/signup">Sign up</Link>
            </p>
          </Card.Body>
        </Card>
      </div>
    </>
  );
}

export default LoginForm;
