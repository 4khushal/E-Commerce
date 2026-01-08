import { Outlet, Link, useLocation } from 'react-router-dom'
import { Container, Nav, Navbar, NavbarBrand } from 'react-bootstrap'
import { useAdminAuth } from '../../context/AdminAuthContext'

const AdminLayout = () => {
  const location = useLocation()
  const { admin, logout } = useAdminAuth()

  const handleSignOut = () => {
    logout()
  }

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/products', label: 'Products', icon: '📦' },
    { path: '/admin/orders', label: 'Orders', icon: '🛒' },
    { path: '/admin/categories', label: 'Categories', icon: '🏷️' },
  ]

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
        <Container fluid>
          <NavbarBrand as={Link} to="/admin" className="fw-bold">
            🛍️ Admin Panel
          </NavbarBrand>
          <Navbar.Toggle aria-controls="admin-navbar" />
          <Navbar.Collapse id="admin-navbar">
            <Nav className="me-auto">
              {navItems.map((item) => (
                <Nav.Link
                  key={item.path}
                  as={Link}
                  to={item.path}
                  active={location.pathname === item.path}
                  className={location.pathname === item.path ? 'active' : ''}
                >
                  <span className="me-2">{item.icon}</span>
                  {item.label}
                </Nav.Link>
              ))}
            </Nav>
            <Nav>
              {/* <Nav.Link as={Link} to="/">
                ← Back to Store
              </Nav.Link> */}
              <Nav.Link className="text-muted">
                {admin?.email || 'Admin'}
              </Nav.Link>
              <Nav.Link onClick={handleSignOut}>Sign Out</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <main className="flex-grow-1 bg-light">
        <Container fluid className="py-4">
          <Outlet />
        </Container>
      </main>
    </div>
  )
}

export default AdminLayout

