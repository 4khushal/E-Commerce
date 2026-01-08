// Stripe Checkout API endpoint
// This creates a Stripe checkout session and handles payment processing

const express = require('express')
const router = express.Router()
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

// POST /api/create-checkout-session
router.post('/create-checkout-session', async (req, res) => {
  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('Stripe secret key is not configured')
      return res.status(500).json({ 
        error: 'Stripe is not configured. Please add STRIPE_SECRET_KEY to server/.env' 
      })
    }

    const { items, userId, shippingAddress } = req.body

    // Validate input
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items are required' })
    }

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' })
    }

    // Calculate total amount (items are in cents)
    const totalAmount = items.reduce((sum, item) => {
      return sum + (item.price * item.quantity)
    }, 0)

    // Convert items to Stripe line items format
    // Stripe expects prices in cents (smallest currency unit)
    // IMPORTANT: Prices from database are ALREADY in cents (e.g., 3200 = $32.00)
    // Do NOT multiply by 100 - use price directly
    const lineItems = items.map((item) => {
      if (!item.name) {
        throw new Error('Item name is required')
      }
      
      // Prices are already in cents from the database
      // Database stores prices in cents (e.g., 3200 for $32.00)
      // Stripe needs prices in cents, so use directly
      const priceInCents = Math.round(parseFloat(item.price))
      
      if (priceInCents <= 0) {
        throw new Error(`Invalid price for item: ${item.name}`)
      }
      
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            description: item.description || '',
            images: item.image ? [item.image] : [],
          },
          unit_amount: priceInCents,
        },
        quantity: item.quantity || 1,
      }
    })

    // Create Stripe checkout session
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
    
    // ALWAYS use minimal format for metadata (Stripe has 500 char limit per metadata value)
    // Store only: id:quantity pairs (e.g., "id1:qty1,id2:qty2")
    // Full item details are available in line_items, so we don't need them in metadata
    const minimalItems = items.map(item => `${item.id}:${item.quantity}`).join(',')
    
    // CRITICAL: Ensure we never accidentally pass the full items array
    // Double-check that minimalItems is a string, not an array or JSON stringified array
    if (typeof minimalItems !== 'string') {
      throw new Error('Internal error: items metadata must be a string')
    }
    
    // Validate minimal items length
    if (minimalItems.length > 500) {
      throw new Error('Too many items in cart. Please reduce the number of items.')
    }
    
    // Store shipping address (compact format with shortened keys)
    let shippingMetadata = ''
    if (shippingAddress) {
      const compactShipping = {
        fn: shippingAddress.firstName || '',
        ln: shippingAddress.lastName || '',
        e: shippingAddress.email || '',
        p: shippingAddress.phone || '',
        a: shippingAddress.address || '',
        c: shippingAddress.city || '',
        s: shippingAddress.state || '',
        z: shippingAddress.zipCode || '',
        co: shippingAddress.country || 'US'
      }
      shippingMetadata = JSON.stringify(compactShipping)
      
      // If still too long, store only essential fields
      if (shippingMetadata.length > 500) {
        const essentialShipping = {
          fn: shippingAddress.firstName || '',
          ln: shippingAddress.lastName || '',
          e: shippingAddress.email || '',
          p: shippingAddress.phone || ''
        }
        shippingMetadata = JSON.stringify(essentialShipping)
      }
    }
    
    // Final safety check: ensure metadata values don't exceed 500 chars
    const itemsMetadata = String(minimalItems)
    if (itemsMetadata.length > 500) {
      throw new Error(`Items metadata too long (${itemsMetadata.length} chars). Max 500 chars allowed.`)
    }
    
    // Calculate expected total for verification
    const expectedTotalInCents = items.reduce((sum, item) => {
      return sum + (Math.round(parseFloat(item.price)) * (item.quantity || 1))
    }, 0)
    const expectedTotalInDollars = (expectedTotalInCents / 100).toFixed(2)
    
    console.log('Creating Stripe session with minimal metadata:')
    console.log('  Items metadata length:', itemsMetadata.length, 'chars')
    console.log('  Items metadata preview:', itemsMetadata.substring(0, 100) + '...')
    console.log('  Shipping metadata length:', shippingMetadata.length, 'chars')
    console.log('  Expected total:', `$${expectedTotalInDollars} (${expectedTotalInCents} cents)`)
    console.log('  Line items:', lineItems.map(li => `${li.quantity}x ${li.price_data.product_data.name} @ $${(li.price_data.unit_amount / 100).toFixed(2)}`).join(', '))
    
    // Create session with minimal metadata - explicitly use itemsMetadata to prevent any accidental override
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${frontendUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/checkout/cancel`,
      client_reference_id: userId,
      metadata: {
        userId: String(userId),
        items: itemsMetadata, // Format: "id1:qty1,id2:qty2" - explicitly use minimal format
        shippingAddress: shippingMetadata || '',
      },
      customer_email: shippingAddress?.email || undefined,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB'],
      },
    })
    
    console.log('✅ Stripe checkout session created:', session.id)

    console.log('Stripe checkout session created:', session.id)
    
    res.json({ 
      sessionId: session.id,
      url: session.url 
    })
  } catch (error) {
    console.error('Stripe checkout session error:', error)
    console.error('Error details:', {
      message: error.message,
      type: error.type,
      code: error.code,
      statusCode: error.statusCode
    })
    
    // Provide more helpful error messages
    let errorMessage = 'Failed to create checkout session'
    if (error.type === 'StripeInvalidRequestError') {
      errorMessage = `Invalid request: ${error.message}`
    } else if (error.type === 'StripeAuthenticationError') {
      errorMessage = 'Stripe authentication failed. Check your API keys.'
    } else if (error.message) {
      errorMessage = error.message
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// GET /api/checkout-session/:sessionId
// Retrieve checkout session details (for success page)
router.get('/checkout-session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'payment_intent'],
    })

    // Reconstruct full items from line_items and metadata
    let items = []
    if (session.metadata?.items) {
      try {
        // Try parsing as JSON first (compact format: [{id, qty, price}])
        const parsed = JSON.parse(session.metadata.items)
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id) {
          items = parsed.map(item => ({
            id: item.id,
            quantity: item.qty || item.quantity,
            price: item.price,
          }))
        }
      } catch (e) {
        // If not JSON, it's in minimal format "id1:qty1,id2:qty2"
        if (session.metadata.items.includes(':')) {
          const itemsStr = session.metadata.items
          const itemPairs = itemsStr.split(',')
          items = itemPairs.map(pair => {
            const [id, qty] = pair.split(':')
            return {
              id: id || '',
              quantity: parseInt(qty) || 1,
            }
          })
        }
      }
    }

    // If we have line_items, enrich items with full product details
    // IMPORTANT: Keep prices in cents (database format)
    if (session.line_items?.data && items.length > 0) {
      items = items.map((item, index) => {
        const lineItem = session.line_items.data[index]
        if (lineItem) {
          return {
            ...item,
            name: lineItem.description || lineItem.price?.product?.name || '',
            image: lineItem.price?.product?.images?.[0] || '',
            // Keep price in cents - use item.price if available, otherwise use unit_amount directly (already in cents)
            price: item.price || lineItem.price?.unit_amount || 0,
            description: lineItem.price?.product?.description || '',
          }
        }
        return item
      })
    } else if (session.line_items?.data && items.length === 0) {
      // Fallback: reconstruct from line_items only
      // Keep prices in cents (unit_amount is already in cents from Stripe)
      items = session.line_items.data.map(lineItem => ({
        id: lineItem.price?.product?.metadata?.productId || '',
        quantity: lineItem.quantity,
        price: lineItem.price.unit_amount, // Already in cents, don't divide
        name: lineItem.description || lineItem.price?.product?.name || '',
        image: lineItem.price?.product?.images?.[0] || '',
        description: lineItem.price?.product?.description || '',
      }))
    }

    // Convert compact shipping address back to full format for frontend
    let shippingAddress = null
    if (session.metadata?.shippingAddress) {
      try {
        const compact = JSON.parse(session.metadata.shippingAddress)
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
          shippingAddress = JSON.parse(session.metadata.shippingAddress)
        } catch (e2) {
          shippingAddress = null
        }
      }
    }

    res.json({
      sessionId: session.id,
      paymentStatus: session.payment_status,
      customerEmail: session.customer_email,
      amountTotal: session.amount_total,
      currency: session.currency,
      metadata: session.metadata,
      items: items, // Reconstructed items array
      lineItems: session.line_items?.data || [], // Full line items from Stripe
      shippingAddress: shippingAddress, // Converted to full format
    })
  } catch (error) {
    console.error('Error retrieving checkout session:', error)
    res.status(500).json({ 
      error: error.message || 'Failed to retrieve checkout session' 
    })
  }
})

// POST /api/stripe-webhook
// Handle Stripe webhooks (for production - requires Stripe CLI for local testing)
router.post('/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object
      console.log('Payment successful for session:', session.id)
      // Here you would typically create the order in Supabase
      // This is handled in the success page for now
      break
    case 'payment_intent.succeeded':
      console.log('Payment intent succeeded')
      break
    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  res.json({ received: true })
})

module.exports = router

