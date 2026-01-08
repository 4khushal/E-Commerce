// Backend API endpoint for sending SMS via Twilio
// This file should be placed in your backend server (Node.js/Express)

const express = require('express')
const router = express.Router()
const twilio = require('twilio')

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

// POST /api/send-sms
router.post('/send-sms', async (req, res) => {
  try {
    const { phoneNumber, message } = req.body

    // Validate input
    if (!phoneNumber || !message) {
      return res.status(400).json({ 
        error: 'Phone number and message are required' 
      })
    }

    // Send SMS via Twilio
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio number: +12184844654
      to: phoneNumber, // Recipient number
    })

    console.log('SMS sent successfully:', result.sid)
    
    res.json({ 
      success: true, 
      sid: result.sid,
      message: 'SMS sent successfully'
    })
  } catch (error) {
    console.error('Twilio error:', error)
    
    // Handle specific Twilio errors
    if (error.code === 21211) {
      return res.status(400).json({ 
        error: 'Invalid phone number format. Use E.164 format (e.g., +1234567890)' 
      })
    }
    
    if (error.code === 21608) {
      return res.status(400).json({ 
        error: 'Phone number not verified. Verify it in Twilio Console (trial accounts only)' 
      })
    }
    
    res.status(500).json({ 
      error: error.message || 'Failed to send SMS' 
    })
  }
})

module.exports = router

