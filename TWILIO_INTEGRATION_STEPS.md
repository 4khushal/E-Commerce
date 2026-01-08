# Twilio Integration Steps

## Your Twilio Credentials

Replace these with your actual Twilio credentials from the Twilio Console:

```
Account SID: your_twilio_account_sid_here
Auth Token: your_twilio_auth_token_here
Phone Number: +1234567890
```

## Choose Your Integration Method

### Option 1: Supabase Edge Function (Recommended - No Backend Needed)

**Advantages:**
- ✅ No separate backend server needed
- ✅ Serverless - scales automatically
- ✅ Easy to deploy
- ✅ Free tier available

**Steps:**

1. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

3. **Link your project**:
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. **Set environment variables**:
   ```bash
   supabase secrets set TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
   supabase secrets set TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
   supabase secrets set TWILIO_PHONE_NUMBER=+1234567890
   ```

5. **Deploy the function**:
   ```bash
   supabase functions deploy send-sms
   ```

6. **Update `src/services/notifications.js`**:
   - Uncomment the "OPTION 2: Supabase Edge Function" section
   - Make sure to import supabase at the top

### Option 2: Backend API Server (Node.js/Express)

**Advantages:**
- ✅ Full control over the server
- ✅ Can add more features
- ✅ Easier debugging

**Steps:**

1. **Create backend directory** (if not exists):
   ```bash
   mkdir server
   cd server
   ```

2. **Initialize Node.js project**:
   ```bash
   npm init -y
   ```

3. **Install dependencies**:
   ```bash
   npm install express twilio cors dotenv
   ```

4. **Create `.env` file**:
   ```env
   TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
   TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
   TWILIO_PHONE_NUMBER=+1234567890
   PORT=3001
   ```

5. **Start the server**:
   ```bash
   node server.js
   ```

6. **Update `src/services/notifications.js`**:
   - Uncomment the "OPTION 1: Backend API" section
   - Update the API URL if needed

## Testing

1. **Verify phone numbers** (Trial accounts only):
   - Go to Twilio Console → Phone Numbers → Verified Caller IDs
   - Add the phone numbers you want to test with

2. **Test the integration**:
   - Go to admin dashboard
   - Approve an order
   - Check if SMS is sent

3. **Check logs**:
   - Backend: Check server console
   - Supabase: Check function logs in Supabase Dashboard

## Important Notes

⚠️ **Trial Account Limitations:**
- Can only send SMS to **verified phone numbers**
- Verify numbers in Twilio Console
- Upgrade account to send to any number

⚠️ **Security:**
- Never expose Auth Token in frontend code
- Always use backend/Edge Function
- Keep credentials in environment variables

## Troubleshooting

**"Phone number not verified" error:**
- You're on a trial account
- Verify the recipient number in Twilio Console
- Or upgrade your Twilio account

**"Invalid phone number format" error:**
- Use E.164 format: `+1234567890`
- Include country code

**"CORS error" (if using backend):**
- Make sure CORS is enabled in your Express server
- Check the `cors()` middleware is configured

## Next Steps

1. Choose your integration method (Supabase Edge Function recommended)
2. Follow the steps above
3. Update `src/services/notifications.js` to uncomment the chosen option
4. Test by approving an order in admin dashboard

