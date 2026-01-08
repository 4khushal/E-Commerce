import { useEffect, useState, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { Container, Card, Alert, Button, Spinner } from 'react-bootstrap'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { createOrder, checkOrderExists } from '../services/supabase'
import { formatPrice } from '../utils/format'
import { showToast } from '../utils/toast'
import { Link } from 'react-router-dom'
import { apiUrl } from '../utils/config'

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const navigate = useNavigate()
  const { user } = useAuth()
  const { clearCart } = useCart()
  const [loading, setLoading] = useState(true)
  const [sessionData, setSessionData] = useState(null)
  const [orderCreated, setOrderCreated] = useState(false)
  const [error, setError] = useState(null)
  const orderCreationInProgress = useRef(false) // Prevent duplicate order creation

  useEffect(() => {
    const processPayment = async () => {
      if (!sessionId) {
        setError('No session ID provided')
        setLoading(false)
        return
      }

      // Prevent duplicate processing
      if (orderCreationInProgress.current) {
        console.log('Order creation already in progress, skipping...')
        return
      }

      try {
        // Retrieve session details from backend
        const response = await fetch(`${apiUrl}/api/checkout-session/${sessionId}`)
        
        if (!response.ok) {
          throw new Error('Failed to retrieve payment session')
        }

        const session = await response.json()
        setSessionData(session)

        // Create order in Supabase if payment was successful
        // Check both orderCreated state and inProgress ref to prevent duplicates
        if (session.paymentStatus === 'paid' && !orderCreated && !orderCreationInProgress.current) {
          orderCreationInProgress.current = true // Mark as in progress
          try {
            const metadata = session.metadata || {}
            
            // Use items from response (already reconstructed) or parse from metadata
            let items = session.items || []
            if (items.length === 0 && metadata.items) {
              try {
                items = JSON.parse(metadata.items)
              } catch (e) {
                // If parsing fails, items might be in minimal format
                // Use lineItems from Stripe to reconstruct
                if (session.lineItems && session.lineItems.length > 0) {
                  items = session.lineItems.map(lineItem => ({
                    id: lineItem.price?.product?.metadata?.productId || '',
                    quantity: lineItem.quantity,
                    price: lineItem.price.unit_amount, // Keep in cents (database format)
                    name: lineItem.description || lineItem.price.product.name,
                    image: lineItem.price.product.images?.[0] || '',
                  }))
                }
              }
            }
            
            // Get shipping address - use converted format from session or parse from metadata
            let shippingAddress = session.shippingAddress || {}
            if (!shippingAddress || Object.keys(shippingAddress).length === 0) {
              if (metadata.shippingAddress) {
                try {
                  const compact = JSON.parse(metadata.shippingAddress)
                  // Convert compact keys to full keys
                  shippingAddress = {
                    firstName: compact.fn || '',
                    lastName: compact.ln || '',
                    email: compact.e || '',
                    phone: compact.p || '',
                    address: compact.a || '',
                    city: compact.c || '',
                    state: compact.s || '',
                    zipCode: compact.z || '',
                    country: compact.co || 'US',
                  }
                } catch (e) {
                  // If parsing fails, try as-is (might already be full format)
                  try {
                    shippingAddress = JSON.parse(metadata.shippingAddress)
                  } catch (e2) {
                    shippingAddress = {}
                  }
                }
              }
            }

            const orderData = {
              user_id: user?.id || metadata.userId,
              items: items,
              // Store total in cents (database expects cents, formatPrice divides by 100)
              total: session.amountTotal, // Already in cents from Stripe
              shipping_address: shippingAddress,
              status: 'pending', // Will be updated by admin
              stripe_payment_intent_id: sessionId,
            }

            // Check if order already exists for this sessionId to prevent duplicates
            const orderExists = await checkOrderExists(sessionId)
            if (orderExists) {
              console.log('Order already exists for this session, skipping creation')
              setOrderCreated(true)
            } else {
              // Create new order
              await createOrder(orderData)
              setOrderCreated(true)
            }
            
            // Always clear cart after successful payment (regardless of order creation status)
            // Payment was successful, so items should be removed from cart
            try {
              await clearCart()
              console.log('Cart cleared successfully after payment')
            } catch (clearCartError) {
              console.error('Error clearing cart:', clearCartError)
              // Don't fail the whole process if cart clearing fails
              // Cart will be cleared on next page load or user action
            }
            
            showToast.success('Order placed successfully!')
          } catch (orderError) {
            console.error('Error creating order:', orderError)
            // Even if order creation fails, clear cart if payment was successful
            // Payment went through, so items should be removed
            try {
              await clearCart()
              console.log('Cart cleared after payment (order creation failed)')
            } catch (clearCartError) {
              console.error('Error clearing cart:', clearCartError)
            }
            // Reset the flag on error so user can retry if needed
            orderCreationInProgress.current = false
            // Don't fail the success page if order creation fails
            // Admin can manually create order if needed
          } finally {
            // Always reset the flag after order creation attempt
            orderCreationInProgress.current = false
          }
        }

        setLoading(false)
      } catch (err) {
        console.error('Error processing payment:', err)
        setError(err.message || 'Failed to process payment')
        setLoading(false)
        orderCreationInProgress.current = false // Reset on error
      }
    }

    processPayment()
    // Only depend on sessionId - remove other dependencies to prevent re-runs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId])

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" role="status" className="mb-3">
          <span className="visually-hidden">Processing payment...</span>
        </Spinner>
        <p>Processing your payment...</p>
      </Container>
    )
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger">
          <Alert.Heading>Payment Processing Error</Alert.Heading>
          <p>{error}</p>
          <hr />
          <div className="d-flex gap-2">
            <Button variant="primary" onClick={() => navigate('/checkout')}>
              Back to Checkout
            </Button>
            <Button variant="outline-secondary" onClick={() => navigate('/')}>
              Go to Home
            </Button>
          </div>
        </Alert>
      </Container>
    )
  }

  return (
    <>
      <Helmet>
        <title>Payment Successful - Ecommerce Store</title>
      </Helmet>

      <Container className="my-5">
        <div className="text-center mb-4">
          <div className="mb-3" style={{ fontSize: '4rem' }}>✅</div>
          <h1 className="text-success">Payment Successful!</h1>
          <p className="text-muted">Thank you for your purchase</p>
        </div>

        <Card className="mb-4">
          <Card.Body>
            <h5 className="mb-3">Order Details</h5>
            {sessionData && (
              <div>
                <p><strong>Session ID:</strong> {sessionData.sessionId}</p>
                <p><strong>Amount Paid:</strong> {formatPrice(sessionData.amountTotal)}</p>
                {sessionData.customerEmail && (
                  <p><strong>Email:</strong> {sessionData.customerEmail}</p>
                )}
                {orderCreated && (
                  <Alert variant="success" className="mt-3">
                    Your order has been created and will be processed shortly.
                  </Alert>
                )}
              </div>
            )}
          </Card.Body>
        </Card>

        <div className="text-center">
          <p className="mb-3">
            You will receive an email confirmation shortly. We'll notify you when your order ships.
          </p>
          <div className="d-flex gap-2 justify-content-center">
            <Button as={Link} to="/orders" variant="primary">
              View My Orders
            </Button>
            <Button as={Link} to="/products" variant="outline-primary">
              Continue Shopping
            </Button>
          </div>
        </div>
      </Container>
    </>
  )
}

export default CheckoutSuccess

