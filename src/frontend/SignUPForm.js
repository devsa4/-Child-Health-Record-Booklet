import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';
import axios from 'axios';

function SignUPForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdult, setIsAdult] = useState(false);

  const handleCheckboxChange = (e) => {
    setIsAdult(e.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/signup', {
        fullName,
        email,
        password,
        isAdult
      });
      alert(res.data.message);
      setFullName('');
      setEmail('');
      setPassword('');
      setIsAdult(false);
    } catch (err) {
      console.error('Frontend error:', err.response || err);
      alert('Signup failed');
    }
  };

  return (
    <div style={{ backgroundColor: "rgba(214, 254, 248, 1)", minHeight: "100vh" }}>
      <Card style={{ width: '30rem', backgroundColor: "rgba(132, 232, 217, 1)" }} className="position-relative position-absolute top-50 start-50 translate-middle">
        <Card.Body>
          <Card.Title className='text-center'>SignUp</Card.Title>
          <br />
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formBasicName">
              <Form.Control 
                type="text" 
                placeholder="Full Name" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Control 
                type="email" 
                placeholder="Email Address" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Control 
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicCheckbox">
              <Form.Check 
                type="checkbox" 
                label="I am over 18 years old" 
                checked={isAdult} 
                onChange={handleCheckboxChange} 
              />
            </Form.Group>

            <div className='text-center'>
              <Button variant="primary" type="submit" disabled={!isAdult}>
                Sign Up
              </Button>
            </div>
          </Form>
          <br />
          <div className='text-center'>
            <p>Already have an account? <Link to="/login">Log in</Link></p>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

export default SignUPForm;
