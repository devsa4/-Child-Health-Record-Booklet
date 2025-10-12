import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUser, FaLock, FaSignInAlt } from 'react-icons/fa';
import { MdSecurity } from 'react-icons/md';
import './LoginForm.css';
import { syncUsers } from "../utils/indexeddb";
import { preloadAllUsers, verifyOfflineUser,addUser} from "../utils/indexeddb";
import { useEffect } from "react";

function LoginForm() {
  const [nationalId, setNationalId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
  if (navigator.onLine) {
    preloadAllUsers();
  }
  }, []);

  const handleLogin = async (e) => {
  e.preventDefault();

  if (!nationalId || !password) {
    setErrorMessage('Please enter both National ID and password.');
    return;
  }

  if (navigator.onLine) {
    syncUsers();
    try {
      const res = await axios.post('http://localhost:5000/login', {
        nationalId: nationalId.trim(),
        password: password.trim(),
      });

      await addUser({
        nationalId: nationalId.trim(),
        fullName: res.data.fullName || "Unknown",
        passwordHash: res.data.passwordHash, // ✅ use backend hash directly
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("loggedInUserId", res.data.userId);
      setNationalId('');
      setPassword('');
      setErrorMessage('');
      navigate('/home');
    } catch (err) {
      console.error('Login error:', err.response || err);
      setErrorMessage(err.response?.data?.message || 'Invalid National ID or Password.');
    }
  }else {
  const offlineUser = await verifyOfflineUser(nationalId, password);
  console.log("🧪 Offline user lookup result:", offlineUser);

  if (offlineUser) {
    console.log("✅ Offline login success — navigating to /home");
    localStorage.setItem("token", "offline-token");
    localStorage.setItem("loggedInUserId", offlineUser.nationalId);
    setErrorMessage('');
    window.location.assign('/home');
  } else {
    console.log("❌ Offline login failed — showing error popup");
    setErrorMessage("Offline login failed. Please check your credentials.");
  }
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

      {/* Error Popup */}
      {errorMessage && (
        <div className="error-popup-overlay">
          <div className="error-popup">
            <p>{errorMessage}</p>
            <button onClick={() => setErrorMessage('')} className="close-popup-btn">
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default LoginForm;
