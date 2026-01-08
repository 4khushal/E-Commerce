# Start SMS Notification Server

## Quick Setup

### Step 1: Create .env file in server folder

Create `server/.env` file with your Twilio credentials:

```env
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
PORT=3002
NODE_ENV=development
```

### Step 2: Start the SMS Server

Open a **new terminal window** and run:

```bash
cd server
npm start
```

You should see:
```
🚀 SMS Notification Server running on http://localhost:3002
📱 Twilio configured with number: +1234567890
```

### Step 3: Keep Server Running

**Important**: Keep this terminal window open while using the admin dashboard. The server must be running for SMS to work.

### Step 4: Test SMS

1. Make sure the SMS server is running (Step 2)
2. Go to admin dashboard: `http://localhost:3001/admin` (or `http://localhost:3000/admin`)
3. Approve an order
4. SMS should be sent!

## Troubleshooting

**"SMS server is not running" error:**
- Make sure you started the server (Step 2)
- Check if port 3001 is available
- Verify the server is running: `http://localhost:3002/health`

**"Phone number not verified" error:**
- You're on a Twilio trial account
- Verify the phone number in Twilio Console
- Go to: Phone Numbers → Verified Caller IDs

**Port 3001 already in use:**
- Change PORT in `server/.env` to a different port (e.g., 3003)
- Update `src/services/notifications.js` to use the new port

## Running Both Servers

You'll need **two terminal windows**:

**Terminal 1** - Frontend (Admin Dashboard):
```bash
npm run dev:admin
```

**Terminal 2** - SMS Backend Server:
```bash
cd server
npm start
```

Both must be running for SMS to work!

