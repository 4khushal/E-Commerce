import { Container, Row, Col } from 'react-bootstrap'
import { Link } from 'react-router-dom'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer-custom mt-auto">
      <Container>
        <Row className="py-5">
          <Col xs={12} md={4} className="mb-4 mb-md-0">
            <h5 className="fw-bold mb-3">Ecommerce Store</h5>
            <p className="text-muted mb-3">
              Your one-stop shop for quality products at great prices. Shop with confidence
              and enjoy fast, reliable delivery.
            </p>
            <div className="social-links">
              <a
                href="#"
                className="social-link me-3"
                aria-label="Facebook"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="social-icon">📘</span>
              </a>
              <a
                href="#"
                className="social-link me-3"
                aria-label="Twitter"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="social-icon">🐦</span>
              </a>
              <a
                href="#"
                className="social-link"
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="social-icon">📷</span>
              </a>
            </div>
          </Col>
          <Col xs={6} md={2} className="mb-4 mb-md-0">
            <h6 className="fw-semibold mb-3">Shop</h6>
            <ul className="list-unstyled footer-links">
              <li>
                <Link to="/products" className="footer-link">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/products?category=clothes" className="footer-link">
                  Clothes
                </Link>
              </li>
              <li>
                <Link to="/products?category=shoes" className="footer-link">
                  Shoes
                </Link>
              </li>
              <li>
                <Link to="/products?category=accessories" className="footer-link">
                  Accessories
                </Link>
              </li>
            </ul>
          </Col>
          <Col xs={6} md={2} className="mb-4 mb-md-0">
            <h6 className="fw-semibold mb-3">Support</h6>
            <ul className="list-unstyled footer-links">
              <li>
                <Link to="/orders" className="footer-link">
                  My Orders
                </Link>
              </li>
              <li>
                <Link to="/profile" className="footer-link">
                  Account
                </Link>
              </li>
              <li>
                <a href="#" className="footer-link">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  Returns
                </a>
              </li>
            </ul>
          </Col>
          <Col xs={12} md={4}>
            <h6 className="fw-semibold mb-3">Newsletter</h6>
            <p className="text-muted small mb-3">
              Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
            </p>
            <div className="input-group">
              <input
                type="email"
                className="form-control form-control-sm"
                placeholder="Enter your email"
                aria-label="Email address"
              />
              <button className="btn btn-primary btn-sm" type="button">
                Subscribe
              </button>
            </div>
          </Col>
        </Row>
        <hr className="footer-divider" />
        <Row className="py-3">
          <Col xs={12} md={6} className="text-center text-md-start mb-2 mb-md-0">
            <p className="text-muted small mb-0">
              &copy; {currentYear} Ecommerce Store By Khushal Nandan. All rights reserved.
            </p>
          </Col>
          <Col xs={12} md={6} className="text-center text-md-end">
            <div className="footer-legal-links">
              <a href="#" className="footer-link small me-3">
                Privacy Policy
              </a>
              <a href="#" className="footer-link small me-3">
                Terms of Service
              </a>
              <a href="#" className="footer-link small">
                Cookie Policy
              </a>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  )
}

export default Footer

