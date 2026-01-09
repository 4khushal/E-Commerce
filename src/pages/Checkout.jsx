import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabase'
import { stripePromise, createCheckoutSession } from '../services/stripe'
import { formatPrice } from '../utils/format'
import LoadingSpinner from '../components/LoadingSpinner'
import { showToast } from '../utils/toast'

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [error, setError] = useState(null)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
  })

  // Load profile information when component mounts
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setLoadingProfile(false)
        return
      }

      try {
        setLoadingProfile(true)
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name, phone, address, city, state, zip_code')
          .eq('id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') {
          // PGRST116 means no rows returned - profile doesn't exist yet, which is fine
          console.warn('Error loading profile:', error)
        }

        if (data) {
          // Pre-fill form with profile data
          setFormData(prev => ({
            ...prev,
            firstName: data.first_name || prev.firstName,
            lastName: data.last_name || prev.lastName,
            phone: data.phone || prev.phone,
            address: data.address || prev.address,
            city: data.city || prev.city,
            state: data.state || prev.state,
            zipCode: data.zip_code || prev.zipCode,
            email: user.email || prev.email,
          }))
        }
      } catch (err) {
        console.error('Error loading profile:', err)
      } finally {
        setLoadingProfile(false)
      }
    }

    loadProfile()
  }, [user])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Prepare shipping address
      const shippingAddress = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
      }

      // Create Stripe checkout session
      const session = await createCheckoutSession(
        cartItems,
        user.id,
        shippingAddress
      )

      if (!session.sessionId || !session.url) {
        throw new Error('Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      // Use the URL directly from Stripe session (more reliable)
      if (session.url) {
        window.location.href = session.url
      } else if (session.sessionId) {
        // Fallback: use Stripe.js redirect
        const stripe = await stripePromise
        if (stripe) {
          const { error: redirectError } = await stripe.redirectToCheckout({
            sessionId: session.sessionId,
          })

          if (redirectError) {
            throw new Error(redirectError.message)
          }
        } else {
          throw new Error('Stripe is not initialized. Check your publishable key.')
        }
      } else {
        throw new Error('No checkout URL or session ID received from server')
      }
    } catch (err) {
      console.error('❌ Checkout error:', err)
      console.error('❌ Error details:', {
        message: err.message,
        name: err.name,
        stack: err.stack,
      })
      
      // Provide user-friendly error messages
      let errorMessage = 'Failed to initiate payment. Please try again.'
      
      if (err.message) {
        if (err.message.includes('timed out') || err.message.includes('timeout')) {
          errorMessage = 'Connection timed out. Please check your internet connection and try again.'
        } else if (err.message.includes('Network error') || err.message.includes('Failed to fetch')) {
          errorMessage = 'Network error. Please check your internet connection and try again.'
        } else if (err.message.includes('not configured')) {
          errorMessage = 'Payment service is not available. Please contact support.'
        } else if (err.message.includes('not authenticated')) {
          errorMessage = 'Please login to continue with checkout.'
        } else if (err.message.includes('empty')) {
          errorMessage = 'Your cart is empty. Please add items before checkout.'
        } else {
          errorMessage = err.message
        }
      }
      
      setError(errorMessage)
      showToast.error(errorMessage)
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <Container className="my-5">
        <Alert variant="warning">
          Please <a href="/login">login</a> to proceed with checkout.
        </Alert>
      </Container>
    )
  }

  if (cartItems.length === 0) {
    return (
      <Container className="my-5">
        <Alert variant="info">Your cart is empty.</Alert>
      </Container>
    )
  }

  if (loadingProfile) {
    return (
      <Container className="my-5">
        <LoadingSpinner />
      </Container>
    )
  }

  return (
    <>
      <Helmet>
        <title>Checkout - Ecommerce Store</title>
        <meta name="description" content="Complete your purchase" />
      </Helmet>

      <Container className="my-5">
        <Row>
          <Col>
            <h1 className="mb-4">Checkout</h1>
          </Col>
        </Row>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={8}>
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Shipping Information</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>First Name *</Form.Label>
                        <Form.Control
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Last Name *</Form.Label>
                        <Form.Control
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Form.Group className="mb-3">
                    <Form.Label>Email *</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Phone *</Form.Label>
                    <Form.Control
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Address *</Form.Label>
                    <Form.Control
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>City *</Form.Label>
                        <Form.Control
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group className="mb-3">
                        <Form.Label>State *</Form.Label>
                        <Form.Control
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group className="mb-3">
                        <Form.Label>Zip Code *</Form.Label>
                        <Form.Control
                          type="text"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Form.Group className="mb-3">
                    <Form.Label>Country *</Form.Label>
                    <Form.Select
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      required
                    >
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="UK">United Kingdom</option>
                    </Form.Select>
                  </Form.Group>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Order Summary</h5>
                </Card.Header>
                <Card.Body>
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="d-flex justify-content-between mb-2"
                    >
                      <span>
                        {item.name} x {item.quantity}
                      </span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  <hr />
                  <div className="d-flex justify-content-between mb-3">
                    <strong>Total:</strong>
                    <strong>{formatPrice(getCartTotal())}</strong>
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-100"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Place Order'}
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Form>
      </Container>
    </>
  )
}

export default Checkout

