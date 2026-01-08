# SMS Notification Setup Guide

## Current Status

The notification service is currently a **placeholder** that only logs to console. To enable real SMS notifications, you need to integrate with an SMS provider.

## Quick Start

1. **Get Twilio Account**: See `TWILIO_SETUP_GUIDE.md` for step-by-step instructions
2. **Get Your Credentials**: Account SID, Auth Token, and Phone Number
3. **Choose Integration Method**: Backend API or Supabase Edge Function
4. **Update Code**: Uncomment and configure the SMS code in `src/services/notifications.js`

## Option 1: Twilio Integration (Recommended)

### Step 1: Sign up for Twilio
1. Go to [Twilio](https://www.twilio.com/)
2. Create a free account (includes $15.50 credit)
3. Get your Account SID and Auth Token from the dashboard
4. Get a phone number from Twilio

### Step 2: Install Twilio SDK
```bash
npm install twilio
```

### Step 3: Create Backend API Endpoint

Create a backend endpoint (Node.js/Express example):

```javascript
// server/routes/notifications.js
const twilio = require('twilio')
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

app.post('/api/send-sms', async (req, res) => {
  const { phoneNumber, message } = req.body
  
  try {
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio number
      to: phoneNumber,
    })
    
    res.json({ success: true, sid: result.sid })
  } catch (error) {
    console.error('Twilio error:', error)
    res.status(500).json({ error: error.message })
  }
})
```

### Step 4: Update Frontend

Update `src/services/notifications.js` to call your backend API.

## Option 2: Supabase Edge Function (Serverless)

### Step 1: Create Supabase Edge Function

```typescript
// supabase/functions/send-sms/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')
const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER')

serve(async (req) => {
  try {
    const { phoneNumber, message } = await req.json()

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
        },
        body: new URLSearchParams({
          From: TWILIO_PHONE_NUMBER,
          To: phoneNumber,
          Body: message,
        }),
      }
    )

    const data = await response.json()
    
    return new Response(JSON.stringify({ success: true, sid: data.sid }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
```

### Step 2: Deploy Function
```bash
supabase functions deploy send-sms
```

### Step 3: Update Frontend
Update `src/services/notifications.js` to call the Supabase function.

## Option 3: AWS SNS

Similar setup but using AWS SNS instead of Twilio.

## Quick Test (Without Real SMS)

For now, the notification service logs to console. Check your browser console when approving orders to see:
- Phone number being used
- Order ID
- Notification attempt

## Troubleshooting

1. **Phone number format**: Ensure phone numbers are in E.164 format (+1234567890)
2. **Check console**: Look for notification logs in browser console
3. **Verify phone in order**: Check if `shipping_address.phone` exists in order data
4. **Backend logs**: If using backend, check server logs for errors

## Current Implementation

The current code:
- ✅ Checks if order status is 'confirmed'
- ✅ Gets phone from `shipping_address.phone`
- ✅ Calls `sendOrderNotification()`
- ❌ Only logs to console (doesn't send real SMS)

To enable real SMS, choose one of the options above and update the notification service.

