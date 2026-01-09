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
        // Log API URL for debugging
        console.log('🔍 Fetching session from:', `${apiUrl}/api/checkout-session/${sessionId}`)
        console.log('🔍 API URL configured:', apiUrl)
        console.log('🔍 Session ID:', sessionId)
        
        // Retrieve session details from backend with timeout and retry logic for mobile
        let response
        let lastError
        let lastStatus
        
        // Retry logic for mobile network issues
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            console.log(`🔄 Attempt ${attempt + 1}/3 to fetch session...`)
            
            // Create AbortController for timeout
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 20000) // 20 second timeout for mobile
            
            response = await fetch(`${apiUrl}/api/checkout-session/${sessionId}`, {
              signal: controller.signal,
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
              mode: 'cors', // Explicitly set CORS mode
            })
            
            clearTimeout(timeoutId)
            lastStatus = response.status
            
            console.log(`📡 Response status: ${response.status} ${response.statusText}`)
            
            if (response.ok) {
              console.log('✅ Successfully retrieved session')
              break // Success, exit retry loop
            } else {
              // Try to get error message from response
              let errorMessage = `Failed to retrieve payment session (Status: ${response.status})`
              try {
                const errorData = await response.json()
                errorMessage = errorData.error || errorMessage
                console.error('❌ Error response:', errorData)
              } catch (e) {
                const text = await response.text()
                console.error('❌ Error response text:', text)
              }
              lastError = new Error(errorMessage)
            }
          } catch (fetchError) {
            console.error(`❌ Fetch error on attempt ${attempt + 1}:`, fetchError)
            lastError = fetchError
            
            if (fetchError.name === 'AbortError') {
              lastError = new Error('Request timed out. Please check your internet connection and try again.')
              console.error('⏱️ Request timed out')
            } else if (fetchError.message.includes('Failed to fetch') || fetchError.message.includes('NetworkError')) {
              lastError = new Error('Network error. Please check your internet connection. If the problem persists, your payment may still have been processed.')
              console.error('🌐 Network error detected')
            } else if (fetchError.message.includes('CORS')) {
              lastError = new Error('Connection error. Please contact support.')
              console.error('🚫 CORS error detected')
            }
            
            // Wait before retry (exponential backoff)
            if (attempt < 2) {
              const waitTime = 1000 * (attempt + 1)
              console.log(`⏳ Waiting ${waitTime}ms before retry...`)
              await new Promise(resolve => setTimeout(resolve, waitTime))
            }
          }
        }
        
        if (!response || !response.ok) {
          const finalError = lastError || new Error(`Failed to retrieve payment session after 3 attempts (Status: ${lastStatus || 'unknown'})`)
          console.error('❌ Final error:', finalError)
          throw finalError
        }

        const session = await response.json()
        console.log('✅ Session data retrieved:', session)
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
        console.error('❌ Error processing payment:', err)
        console.error('❌ Error details:', {
          message: err.message,
          name: err.name,
          stack: err.stack,
          apiUrl: apiUrl,
          sessionId: sessionId,
        })
        
        // Provide user-friendly error messages
        let errorMessage = 'Failed to process payment'
        let showRetry = true
        
        if (err.message) {
          if (err.message.includes('timeout') || err.message.includes('timed out')) {
            errorMessage = 'Connection timed out. Please check your internet connection and try again.'
          } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
            errorMessage = 'Network error. Please check your internet connection. Your payment may still have been processed - please check your orders.'
          } else if (err.message.includes('CORS')) {
            errorMessage = 'Connection error. Please contact support if this persists.'
          } else if (err.message.includes('Status: 404')) {
            errorMessage = 'Session not found. The payment session may have expired. Please contact support.'
            showRetry = false
          } else if (err.message.includes('Status: 500')) {
            errorMessage = 'Server error. Please try again or contact support.'
          } else {
            errorMessage = err.message
          }
        }
        
        // Check if API URL is configured
        if (!apiUrl || apiUrl.includes('localhost')) {
          errorMessage = 'API server is not configured. Please contact support.'
          console.error('⚠️ API URL is not properly configured:', apiUrl)
        }
        
        setError(errorMessage)
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
          <div className="mb-3">
            <p className="small text-muted">
              <strong>Note:</strong> If your payment was successful, your order may still have been processed. 
              Please check your email or contact support with your session ID: <code>{sessionId}</code>
            </p>
          </div>
          <div className="d-flex flex-column flex-sm-row gap-2">
            <Button 
              variant="primary" 
              onClick={() => {
                // Retry the payment processing
                setError(null)
                setLoading(true)
                orderCreationInProgress.current = false
                // Force reload to retry
                const currentUrl = new URL(window.location.href)
                window.location.href = currentUrl.href
              }}
            >
              Retry
            </Button>
            <Button variant="outline-secondary" onClick={() => navigate('/orders')}>
              Check My Orders
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

