# Environment Variables Setup Guide

## Frontend Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Stripe Configuration (Production)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key_here

# Frontend URL (Production)
VITE_FRONTEND_URL=https://your-domain.vercel.app
```

**Important**: All frontend environment variables must start with `VITE_` to be accessible in the React app.

## Backend Environment Variables

Create a `.env` file in the `server` directory with the following variables:

```env
# Server Configuration
NODE_ENV=production
PORT=3002

# Frontend URLs (for CORS)
FRONTEND_URL=https://your-domain.vercel.app
ADMIN_URL=https://admin.your-domain.vercel.app

# Stripe Configuration (Production)
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Twilio Configuration (Optional - for SMS notifications)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

## Getting Your Keys

### Supabase Keys
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to Settings → API
4. Copy:
   - Project URL → `VITE_SUPABASE_URL`
   - anon/public key → `VITE_SUPABASE_ANON_KEY`

### Stripe Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Switch to **Live mode** (toggle in top right)
3. Go to Developers → API keys
4. Copy:
   - Publishable key → `VITE_STRIPE_PUBLISHABLE_KEY`
   - Secret key → `STRIPE_SECRET_KEY`
5. For webhook secret:
   - Go to Developers → Webhooks
   - Create endpoint: `https://your-backend-url.com/api/stripe-webhook`
   - Copy signing secret → `STRIPE_WEBHOOK_SECRET`

### Twilio Keys (Optional)
1. Go to [Twilio Console](https://console.twilio.com)
2. Copy:
   - Account SID → `TWILIO_ACCOUNT_SID`
   - Auth Token → `TWILIO_AUTH_TOKEN`
   - Phone Number → `TWILIO_PHONE_NUMBER`

## Vercel Environment Variables

When deploying to Vercel, add these in the project settings:

1. Go to your Vercel project
2. Settings → Environment Variables
3. Add each variable:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_STRIPE_PUBLISHABLE_KEY`
   - `VITE_FRONTEND_URL`

**Note**: After adding variables, redeploy your project for changes to take effect.

## Backend Hosting Environment Variables

For Railway/Render/Heroku, add these in your platform's environment variables:

- `NODE_ENV=production`
- `PORT=3002` (or your platform's assigned port)
- `FRONTEND_URL=your-frontend-url`
- `ADMIN_URL=your-admin-url`
- `STRIPE_SECRET_KEY=sk_live_...`
- `STRIPE_WEBHOOK_SECRET=whsec_...`
- `TWILIO_ACCOUNT_SID=...` (if using SMS)
- `TWILIO_AUTH_TOKEN=...` (if using SMS)
- `TWILIO_PHONE_NUMBER=...` (if using SMS)

## Security Notes

⚠️ **Never commit `.env` files to Git!**
- `.env` files are already in `.gitignore`
- Use `.env.example` as a template
- Keep production keys secure
- Rotate keys if exposed

## Testing Environment Variables

After setting up, verify:

1. **Frontend**: Check browser console for any missing variable warnings
2. **Backend**: Check server logs on startup
3. **Stripe**: Test with a real payment (use small amount)
4. **Supabase**: Verify data loads correctly
