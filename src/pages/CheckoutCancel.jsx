import { Helmet } from 'react-helmet-async'
import { Container, Card, Alert, Button } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'

const CheckoutCancel = () => {
  const navigate = useNavigate()

  return (
    <>
      <Helmet>
        <title>Payment Cancelled - Ecommerce Store</title>
      </Helmet>

      <Container className="my-5">
        <div className="text-center mb-4">
          <div className="mb-3" style={{ fontSize: '4rem' }}>❌</div>
          <h1 className="text-warning">Payment Cancelled</h1>
          <p className="text-muted">Your payment was not completed</p>
        </div>

        <Card className="mb-4">
          <Card.Body>
            <Alert variant="info">
              <Alert.Heading>No charges were made</Alert.Heading>
              <p className="mb-0">
                You cancelled the payment process. Your cart items are still saved and you can complete your purchase anytime.
              </p>
            </Alert>
          </Card.Body>
        </Card>

        <div className="text-center">
          <div className="d-flex gap-2 justify-content-center">
            <Button as={Link} to="/cart" variant="primary">
              Back to Cart
            </Button>
            <Button as={Link} to="/checkout" variant="outline-primary">
              Try Again
            </Button>
            <Button as={Link} to="/products" variant="outline-secondary">
              Continue Shopping
            </Button>
          </div>
        </div>
      </Container>
    </>
  )
}

export default CheckoutCancel

