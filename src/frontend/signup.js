import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';

function SignUPForm() {
  return (
    <div style={{ backgroundColor: "rgba(214, 254, 248, 1)",
        minHeight: "100vh",}}>
    <Card style={{ width: '30rem',backgroundColor: "rgba(132, 232, 217, 1)" }} className="position-relative position-absolute top-50 start-50 translate-middle">
      <Card.Body>  
        <Card.Title className='text-center'>SignUp</Card.Title>
        <br></br>
        <Form>

        <Form.Group className="mb-3" controlId="formBasicName">
        <Form.Control type="text" placeholder="Full Name" />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Control type="email" placeholder="Email Address" />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formBasicPassword">
        <Form.Control type="password" placeholder="Password" />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formBasicCheckbox">
        <Form.Check type="checkbox" label="I am over 18 years old" />
      </Form.Group>
      <div className='text-center'>
        <Button variant="primary" type="submit">
        Sign Up
      </Button></div>
    </Form> 
    <br></br>
    <div className='text-center'>
    <p>Already have an account? <Link to="/login">
    Log in
    </Link></p>
    
    </div>
    </Card.Body>
    </Card>

    </div>
  );
}

export default SignUPForm;