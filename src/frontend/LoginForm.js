import React from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';
import { FaUser, FaLock, FaSignInAlt } from 'react-icons/fa';
import { MdSecurity } from 'react-icons/md'; // Shield with tick icon
import './LoginForm.css';

function LoginForm() {
  return (
    <>
      {/* Background video */}
      <video autoPlay loop muted playsInline className="bg-video">
        <source src="/background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay to darken video */}
      <div className="bg-video-overlay"></div>

      {/* Bottom vignette */}
      <div className="bg-vignette-bottom"></div>

      {/* Wrapper for hover and layout stability */}
      <div className="login-wrapper position-absolute top-50 start-50 translate-middle">
        <Card className="login-card text-center">
          <Card.Body>
            {/* Title with icon and spacing */}
            <Card.Title className="d-flex align-items-center justify-content-center gap-2 card-title mb-4">
              <MdSecurity style={{ color: '#fff', fontSize: '1.6rem' }} />
              Member Login
            </Card.Title>

            {/* Description text in white */}
            <Card.Text className="mb-4 card-description">
              Please enter your details to securely access the system.
            </Card.Text>

            <Form>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <div className="input-icon-wrapper">
                  <FaUser className="input-icon" />
                  <Form.Control
                    type="text"
                    placeholder="Your National ID"
                    autoComplete="username"
                    aria-label="User ID"
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <div className="input-icon-wrapper">
                  <FaLock className="input-icon" />
                  <Form.Control
                    type="password"
                    placeholder="Enter password"
                    autoComplete="current-password"
                    aria-label="Password"
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
