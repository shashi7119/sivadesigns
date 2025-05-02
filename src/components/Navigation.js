import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navigation() {
  const { user, logout } = useAuth();

  return (
    <Navbar bg="light" expand="lg" className='d-print-none'>
      <Container>
        <Navbar.Brand as={Link} to="/">SSD</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            {user && (user.role==="admin" || user.role==="production") && <NavDropdown title="Settings" id="basic-nav-dropdown">
                {user && user.role==="admin"  && <NavDropdown.Item href="#">
              <Nav.Link as={Link} to="/machine">Machine</Nav.Link>
              </NavDropdown.Item>}
              {user && user.role==="admin"  &&<NavDropdown.Item href="#">
              <Nav.Link as={Link} to="/customer">Customer</Nav.Link>
              </NavDropdown.Item>}
              {user && user.role==="admin"  &&<NavDropdown.Item href="#">
              <Nav.Link as={Link} to="/fabric">Fabric</Nav.Link>
              </NavDropdown.Item>}
              {user && user.role==="admin"  && <NavDropdown.Item href="#">
              <Nav.Link as={Link} to="/construction">Construction</Nav.Link>
              </NavDropdown.Item>}
              {user && (user.role==="admin" || user.role==="production")  &&<NavDropdown.Item href="#">
              <Nav.Link as={Link} to="/process">Process</Nav.Link>
              </NavDropdown.Item>}
              {user && user.role==="admin"  && <NavDropdown.Item href="#">
              <Nav.Link as={Link} to="/width">Width</Nav.Link>
              </NavDropdown.Item>}
              {user && user.role==="admin"  && <NavDropdown.Item href="#">
              <Nav.Link as={Link} to="/sfinishing">Finishing</Nav.Link>
              </NavDropdown.Item>}
            </NavDropdown>}
             {user && (user.role==="admin" || user.role==="store") && <Nav.Link as={Link} to="/storeentry">Store</Nav.Link>}
            {user && (user.role==="admin" || user.role==="SP1"|| user.role==="SP2") && <NavDropdown title="Stock" id="basic-nav-dropdown">
              <NavDropdown.Item href="#">
              <Nav.Link as={Link} to="/pstock">Planning Stock</Nav.Link>
              </NavDropdown.Item>
              <NavDropdown.Item href="#">
              {user && (user.role==="admin") && <Nav.Link as={Link} to="/bstock">Batch Stock</Nav.Link> }
              </NavDropdown.Item>
              </NavDropdown>}
            {user && (user.role==="admin" || user.role==="grey"|| user.role==="SP1"|| user.role==="SP2") && <Nav.Link as={Link} to="/greyentry">Grey Entry</Nav.Link>}
            {user && (user.role==="admin" || user.role==="batch" || user.role==="SP1" || user.role==="SP2") && <Nav.Link as={Link} to="/planning">Planning</Nav.Link>}
            {user && (user.role==="admin" || user.role==="production") && <Nav.Link as={Link} to="/labentry">Lab Entry</Nav.Link>}
            {user && (user.role==="admin" || user.role==="batch" || user.role==="production" || user.role==="batchcomplete"|| user.role==="SP1"|| user.role==="SP2") && <Nav.Link as={Link} to="/batch">Batch</Nav.Link>}
            {user && (user.role==="admin" || user.role==="finishing" || user.role==="SP1" || user.role==="SP2" ) && <Nav.Link as={Link} to="/finishing">Finishing</Nav.Link>}
            {user && (user.role==="admin" || user.role==="delivery" || user.role==="SP1" || user.role==="SP2" ) && <Nav.Link as={Link} to="/delivery">Delivery</Nav.Link>}
            
           
           
              
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