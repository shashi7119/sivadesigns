import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navigation() {
  const { user, logout } = useAuth();


  return (
    <Navbar bg="light" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">Siva Designs</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            {user && <Nav.Link as={Link} to="/planning">Planning</Nav.Link>}
            {user && <Nav.Link as={Link} to="/profile">Add</Nav.Link>}
          </Nav>
          <Nav>
            {user ? (
              <Nav.Link onClick={logout}>Logout</Nav.Link>
            ) : (
              <Nav.Link as={Link} to="/login">Login</Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
    
  );
}


export default Navigation;