import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';

function LoginForm() {
  return (
    <div style={{ backgroundColor: "rgba(214, 254, 248, 1)",
        minHeight: "100vh",}}>
    <Card style={{ width: '30rem',backgroundColor: "rgba(132, 232, 217, 1)" }} className="position-relative position-absolute top-50 start-50 translate-middle text-center">
      <Card.Body>  
        <Card.Title>Login</Card.Title>
        <Form>
      <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Control type="text" placeholder="Your ID" />
      </Form.Group>
      <Form.Group className="mb-3" controlId="formBasicPassword">
        <Form.Control type="password" placeholder="Enter password" />
      </Form.Group>
      <Button variant="primary" type="submit">
        Login
      </Button>
    </Form> 
    <p>Don't have an account?
      <Link to="/">
    Sign up
    </Link>
    </p>
    
    </Card.Body>
    </Card>
    </div>
  );
}

export default LoginForm;