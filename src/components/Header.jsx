import { Link, useNavigate } from 'react-router-dom'
import { Navbar, Nav, Container, Badge, Dropdown, NavDropdown } from 'react-bootstrap'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

const Header = () => {
  const { user, signOut } = useAuth()
  const { getCartItemsCount } = useCart()
  const navigate = useNavigate()
  const cartCount = getCartItemsCount()

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <Navbar bg="white" expand="lg" className="navbar-custom shadow-sm sticky-top">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold brand-logo">
          <span className="brand-icon">🛍️</span>
          <span className="brand-text">E-Commerce </span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-0">
          <span className="navbar-toggler-icon-custom"></span>
        </Navbar.Toggle>
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" className="nav-link-custom">
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/products" className="nav-link-custom">
              Products
            </Nav.Link>
          </Nav>
          <Nav className="align-items-center">
            {user ? (
              <>
                <Nav.Link as={Link} to="/orders" className="nav-link-custom d-none d-md-block">
                  Orders
                </Nav.Link>
                <Dropdown align="end" className="d-inline-block ms-2">
                  <Dropdown.Toggle
                    variant="link"
                    className="nav-link-custom text-decoration-none p-0 d-flex align-items-center"
                    id="user-dropdown"
                  >
                    <span className="user-avatar me-2">
                      {user.email?.charAt(0).toUpperCase()}
                    </span>
                    <span className="d-none d-lg-inline">{user.email?.split('@')[0]}</span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="dropdown-menu-end shadow-sm">
                    <Dropdown.Item as={Link} to="/profile" className="dropdown-item-custom">
                      <span className="me-2">👤</span> Profile
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/orders" className="dropdown-item-custom d-md-none">
                      <span className="me-2">📦</span> Orders
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item
                      onClick={handleSignOut}
                      className="dropdown-item-custom text-danger"
                    >
                      <span className="me-2">🚪</span> Sign Out
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" className="nav-link-custom">
                  Login
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/register"
                  className="btn btn-primary btn-sm ms-2 px-3"
                >
                  Sign Up
                </Nav.Link>
              </>
            )}
            <Nav.Link
              as={Link}
              to="/cart"
              className="nav-link-custom position-relative ms-2 ms-md-3"
            >
              <span className="cart-icon">🛒</span>
              <span className="d-none d-md-inline ms-1">Cart</span>
              {cartCount > 0 && (
                <Badge
                  bg="danger"
                  pill
                  className="position-absolute top-0 start-100 translate-middle cart-badge"
                >
                  {cartCount > 99 ? '99+' : cartCount}
                </Badge>
              )}
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default Header

