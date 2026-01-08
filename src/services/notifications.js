// Phone notification service
// Integrated with Twilio for SMS notifications
// Configured with your Twilio credentials

export const sendOrderNotification = async (phoneNumber, orderId) => {
  try {
    // Validate phone number
    if (!phoneNumber) {
      console.warn('No phone number provided for notification')
      throw new Error('Phone number is required')
    }

    // Format phone number (ensure it starts with +)
    const formattedPhone = phoneNumber.startsWith('+') 
      ? phoneNumber 
      : `+${phoneNumber.replace(/\D/g, '')}` // Remove non-digits and add +

    const message = `Your order #${orderId.substring(0, 8)} has been confirmed! Thank you for your purchase. We'll notify you when it ships.`

    console.log('📱 Attempting to send SMS notification:')
    console.log('   Phone:', formattedPhone)
    console.log('   Order ID:', orderId)
    console.log('   Message:', message)

    // OPTION 1: Call your backend API
    // Use environment variable for API URL, fallback to localhost for development
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002'
    try {
      const response = await fetch(`${apiUrl}/api/send-sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: formattedPhone,
          message: message,
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send notification')
      }
      
      const result = await response.json()
      console.log('✅ SMS sent successfully:', result.sid)
      return result
    } catch (fetchError) {
      // If backend is not running, show helpful error
      if (fetchError.message.includes('Failed to fetch') || fetchError.message.includes('NetworkError')) {
        console.error('❌ Backend server not running. Start it with: cd server && npm install && npm start')
        throw new Error('SMS server is not running. Please start the backend server.')
      }
      throw fetchError
    }

    // OPTION 2: Call Supabase Edge Function (Alternative - No backend needed)
    // Uncomment this if you've deployed the Supabase Edge Function instead
    /*
    const { supabase } = await import('./supabase')
    const { data, error } = await supabase.functions.invoke('send-sms', {
      body: {
        phoneNumber: formattedPhone,
        message: message,
      },
    })
    
    if (error) {
      console.error('Supabase function error:', error)
      throw new Error(error.message || 'Failed to send SMS')
    }
    
    console.log('✅ SMS sent successfully via Supabase function:', data.sid)
    return data
    */
  } catch (error) {
    console.error('❌ Error sending notification:', error)
    throw error
  }
}

// Example backend implementation (Node.js/Express):
/*
// routes/notifications.js
const twilio = require('twilio')
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

app.post('/api/send-sms', async (req, res) => {
  const { phoneNumber, message } = req.body
  
  try {
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    })
    
    res.json({ success: true, sid: result.sid })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})
*/

