import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import Modal from 'react-bootstrap/Modal';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaIdCard,
  FaUserPlus
} from 'react-icons/fa';
import './SignUp.css';
import { addUser } from "../utils/indexeddb"; 

function SignUpForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isAdult, setIsAdult] = useState(false);
  const [nationalId, setNationalId] = useState('');
  const [showTerms, setShowTerms] = useState(false);
  const navigate = useNavigate();
  // Auto-generate National ID on mount
  useEffect(() => {
    const generateNationalId = () => {
      const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomPart = Math.floor(100000 + Math.random() * 900000);
      return `NID-${datePart}-${randomPart}`;
    };
    setNationalId(generateNationalId());
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
  e.preventDefault();

  if (formData.password !== formData.confirmPassword) {
    alert("Passwords don't match!");
    return;
  }

  // Generate NID once
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.floor(100000 + Math.random() * 900000);
  const nid = `NID-${datePart}-${randomPart}`;

  const user = {
    fullName: formData.fullName,
    email: formData.email,
    password: formData.password,
    isAdult,
    nationalId: nid,
  };

  try {
    if (navigator.onLine) {
      try {
        // ONLINE → Save to backend
        const response = await axios.post("http://localhost:5000/signup", user);
// Save the returned userId in localStorage
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("loggedInUserId", response.data.userId);
        navigate("/home");

      } catch (err) {
        console.warn("⚠️ Online save failed, falling back to IndexedDB:", err);
        await addUser(user);
        alert("Saved locally because server is unreachable.");
      }
    } else {
      // OFFLINE → Save to IndexedDB
      await addUser(user);
      alert("⚠️ You are offline. Data saved locally and will sync later.");
      navigate("/home");
    }

    // Reset form always
    setFormData({
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setIsAdult(false);
    setNationalId(nid);
  } catch (err) {
    console.error("❌ Error saving user:", err);
    alert("Signup failed: " + (err.response?.data?.message || err.message));
  }
};

  return (
    <>
      {/* Background video and overlays */}
      <video autoPlay loop muted playsInline className="bg-video">
        <source src="/background.mp4" type="video/mp4" />
      </video>
      <div className="bg-video-white-overlay"></div>
      <div className="bg-video-overlay"></div>
      <div className="bg-vignette-bottom"></div>

      {/* Signup card */}
      <div className="signup-wrapper">
        <Card className="signup-card text-center">
          <Card.Body>
            <Card.Title className="mb-4">
              <FaUserPlus className="me-2" />
              Sign Up
            </Card.Title>

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <div className="d-flex align-items-center">
                  <FaUser className="me-2 text-white" />
                  <Form.Control
                    className="signup-input"
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Full Name"
                    required
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <div className="d-flex align-items-center">
                  <FaEnvelope className="me-2 text-white" />
                  <Form.Control
                    className="signup-input"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email Address"
                    required
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <div className="d-flex align-items-center">
                  <FaLock className="me-2 text-white" />
                  <Form.Control
                    className="signup-input"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    required
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <div className="d-flex align-items-center">
                  <FaLock className="me-2 text-white" />
                  <Form.Control
                    className="signup-input"
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm Password"
                    required
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <div className="d-flex align-items-center">
                  <FaIdCard className="me-2 text-white" />
                  <Form.Control
                    className="signup-input"
                    type="text"
                    value={nationalId}
                    readOnly
                  />
                </div>
                <Form.Text className="text-muted text-start mt-2 d-block">
                  This ID is automatically generated and cannot be changed.
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <div className="signup-consent">
                  <Form.Check
                    type="checkbox"
                    label="I am over 18 years old"
                    checked={isAdult}
                    onChange={(e) => setIsAdult(e.target.checked)}
                    className="me-2"
                    required
                  />
                  <span>
                    I agree to the{' '}
                    <span
                      onClick={() => setShowTerms(true)}
                      className="text-decoration-underline text-info"
                      style={{ cursor: 'pointer' }}
                    >
                      Terms & Conditions
                    </span>.
                  </span>
                </div>
              </Form.Group>

              <Button
                type="submit"
                className="signup-button d-flex align-items-center justify-content-center gap-2"
                disabled={!isAdult} // ✅ Disabled until checkbox is checked
              >
                <FaUserPlus />
                Sign Up
              </Button>
            </Form>

            <p className="signup-text mt-3 text-white">
              Already have an account?{' '}
              <Link to="/" className="text-decoration-none text-info">
                Log in
              </Link>
            </p>
          </Card.Body>
        </Card>
      </div>

      {/* Terms & Conditions Modal */}
      <Modal show={showTerms} onHide={() => setShowTerms(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Terms & Conditions</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ textAlign: 'left' }}>
          <p>
            By signing up, you agree to abide by our platform's rules and policies.
            You confirm that you are at least 18 years old and that the information
            provided is accurate.
          </p>
          <p>
            Your data will be handled securely and in accordance with our privacy policy.
            You may not use the service for unlawful activities or impersonation.
          </p>
          <p>
            For full details, please refer to our official documentation or contact support.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTerms(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default SignUpForm;
