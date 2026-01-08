# Stripe Payment Gateway Integration

## Setup Instructions

### Step 1: Get Stripe API Keys

1. **Sign up for Stripe**:
   - Go to [https://stripe.com](https://stripe.com)
   - Create a free account
   - Complete account setup

2. **Get Your API Keys**:
   - Go to: Dashboard → Developers → API keys
   - Copy your **Publishable key** (starts with `pk_`)
   - Copy your **Secret key** (starts with `sk_`) - keep this secret!

### Step 2: Configure Environment Variables

#### Frontend (.env in root):
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

#### Backend (server/.env):
```env
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
FRONTEND_URL=http://localhost:3000
```

### Step 3: Install Stripe Package

The Stripe package should already be installed. If not:
```bash
cd server
npm install stripe
```

### Step 4: Restart Servers

1. **Restart SMS/Stripe Server**:
   ```bash
   cd server
   npm start
   ```

2. **Restart Frontend** (if needed):
   ```bash
   npm run dev
   ```

## How It Works

1. **User clicks "Place Order"** on checkout page
2. **Frontend calls backend** to create Stripe checkout session
3. **Backend creates session** with cart items and shipping info
4. **User redirected to Stripe** checkout page
5. **User completes payment** on Stripe
6. **Stripe redirects to success page** with session ID
7. **Success page retrieves session** and creates order in Supabase
8. **Order stored** with payment confirmation

## Test Cards (Stripe Test Mode)

Use these test card numbers:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires 3D Secure**: `4000 0025 0000 3155`

**Any future expiry date, any CVC, any ZIP**

## Routes

- `/checkout` - Checkout page (starts payment)
- `/checkout/success` - Payment success page
- `/checkout/cancel` - Payment cancelled page

## Backend API Endpoints

- `POST /api/create-checkout-session` - Creates Stripe checkout session
- `GET /api/checkout-session/:sessionId` - Retrieves session details
- `POST /api/stripe-webhook` - Handles Stripe webhooks (for production)

## Security Notes

⚠️ **Never expose your Stripe Secret Key in frontend code!**
- Secret key must only be in backend `.env` file
- Publishable key is safe to use in frontend

## Production Setup

For production:
1. Switch to **Live mode** in Stripe Dashboard
2. Get **Live API keys** (replace test keys)
3. Set up **webhook endpoint** for payment confirmation
4. Update `FRONTEND_URL` in server `.env` to your production URL

## Troubleshooting

**"Failed to create checkout session"**:
- Check if Stripe secret key is in `server/.env`
- Verify backend server is running on port 3002
- Check browser console for errors

**"Invalid API key"**:
- Make sure you're using test keys in development
- Verify keys are correct in `.env` files

**Payment succeeds but order not created**:
- Check browser console on success page
- Verify Supabase connection
- Check if user is logged in

