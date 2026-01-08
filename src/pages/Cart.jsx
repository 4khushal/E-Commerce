import { Helmet } from 'react-helmet-async'
import { Container, Row, Col, Card, Button, Form, Table } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { formatPrice, getProductImage } from '../utils/format'
import LoadingSpinner from '../components/LoadingSpinner'

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } =
    useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleCheckout = () => {
    if (!user) {
      navigate('/login?redirect=/checkout')
      return
    }
    navigate('/checkout')
  }

  if (cartItems.length === 0) {
    return (
      <>
        <Helmet>
          <title>Cart - Ecommerce Store</title>
        </Helmet>
        <Container className="my-5">
          <Row>
            <Col className="text-center py-5">
              <h2>Your cart is empty</h2>
              <p className="text-muted mb-4">
                Add some products to your cart to get started.
              </p>
              <Button as={Link} to="/products" variant="primary">
                Continue Shopping
              </Button>
            </Col>
          </Row>
        </Container>
      </>
    )
  }

  return (
    <>
      <Helmet>
        <title>Cart - Ecommerce Store</title>
        <meta name="description" content="Review your shopping cart items" />
      </Helmet>

      <Container className="my-5">
        <Row>
          <Col>
            <h1 className="mb-4">Shopping Cart</h1>
          </Col>
        </Row>

        <Row>
          <Col md={8}>
            <Card>
              <Card.Body>
                <Table responsive>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Total</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <img
                              src={getProductImage(item.image)}
                              alt={item.name}
                              style={{
                                width: '60px',
                                height: '60px',
                                objectFit: 'cover',
                                marginRight: '15px',
                              }}
                              onError={(e) => {
                                e.target.src = '/placeholder-image.jpg'
                              }}
                            />
                            <Link
                              to={`/products/${item.id}`}
                              className="text-decoration-none"
                            >
                              {item.name}
                            </Link>
                          </div>
                        </td>
                        <td>{formatPrice(item.price)}</td>
                        <td>
                          <Form.Select
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(item.id, parseInt(e.target.value))
                            }
                            style={{ width: '80px' }}
                          >
                            {[...Array(Math.min(item.stock || 10, 10))].map(
                              (_, i) => (
                                <option key={i + 1} value={i + 1}>
                                  {i + 1}
                                </option>
                              )
                            )}
                          </Form.Select>
                        </td>
                        <td>
                          {formatPrice(item.price * item.quantity)}
                        </td>
                        <td>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                          >
                            Remove
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <div className="text-end">
                  <Button
                    variant="outline-secondary"
                    onClick={clearCart}
                    className="me-2"
                  >
                    Clear Cart
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card>
              <Card.Header>
                <h5 className="mb-0">Order Summary</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex justify-content-between mb-3">
                  <span>Subtotal:</span>
                  <span>{formatPrice(getCartTotal())}</span>
                </div>
                <div className="d-flex justify-content-between mb-3">
                  <span>Shipping:</span>
                  <span>Calculated at checkout</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-4">
                  <strong>Total:</strong>
                  <strong>{formatPrice(getCartTotal())}</strong>
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  className="w-100 mb-2"
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                </Button>
                <Button
                  as={Link}
                  to="/products"
                  variant="outline-secondary"
                  className="w-100"
                >
                  Continue Shopping
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  )
}

export default Cart

