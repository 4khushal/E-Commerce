// Simple Express server for SMS notifications
// Run with: node server/server.js

const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3002
const NODE_ENV = process.env.NODE_ENV || 'development'
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000'
const ADMIN_URL = process.env.ADMIN_URL || 'http://localhost:3001'

// CORS Configuration - Production ready
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) {
      return callback(null, true)
    }
    
    const allowedOrigins = NODE_ENV === 'production' 
      ? [FRONTEND_URL, ADMIN_URL] 
      : ['http://localhost:3000', 'http://localhost:3001']
    
    // Check if origin is in allowed list or is a Vercel domain
    if (allowedOrigins.includes(origin) || origin.includes('.vercel.app')) {
      callback(null, true)
    } else {
      console.log('CORS blocked origin:', origin)
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}

// Middleware
app.use(cors(corsOptions))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Security Headers
app.use((req, res, next) => {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  if (NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }
  
  next()
})

// Rate limiting (basic - consider using express-rate-limit for production)
app.use((req, res, next) => {
  // Simple rate limiting - in production, use express-rate-limit package
  next()
})

// Routes
const notificationsRouter = require('./routes/notifications')
const stripeRouter = require('./routes/stripe')
app.use('/api', notificationsRouter)
app.use('/api', stripeRouter)

// Root endpoint - provide API information
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Ecommerce Backend API Server',
    endpoints: {
      health: '/health',
      sendSMS: 'POST /api/send-sms',
      createCheckoutSession: 'POST /api/create-checkout-session',
      getCheckoutSession: 'GET /api/checkout-session/:sessionId',
    },
    services: {
      twilio: {
        configured: !!process.env.TWILIO_ACCOUNT_SID,
        phoneNumber: process.env.TWILIO_PHONE_NUMBER || 'Not configured'
      },
      stripe: {
        configured: !!process.env.STRIPE_SECRET_KEY,
        frontendUrl: process.env.FRONTEND_URL || 'Not configured'
      }
    }
  })
})

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'SMS notification server is running' })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(err.status || 500).json({
    error: NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    ...(NODE_ENV === 'development' && { stack: err.stack })
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Ecommerce Backend Server running on port ${PORT}`)
  console.log(`🌍 Environment: ${NODE_ENV}`)
  console.log(`🔗 Frontend URL: ${FRONTEND_URL}`)
  console.log(`🔗 Admin URL: ${ADMIN_URL}`)
  if (process.env.TWILIO_PHONE_NUMBER) {
    console.log(`📱 Twilio configured with number: ${process.env.TWILIO_PHONE_NUMBER}`)
  }
})

