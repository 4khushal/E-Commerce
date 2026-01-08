# Quick Stripe Setup

## 1. Get Stripe Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Copy **Publishable key** (starts with `pk_test_`)
3. Copy **Secret key** (starts with `sk_test_`)

## 2. Update Environment Variables

### Frontend (.env in root):
Add this line:
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

### Backend (server/.env):
Add these lines:
```env
STRIPE_SECRET_KEY=sk_test_your_key_here
FRONTEND_URL=http://localhost:3000
```

## 3. Restart Server

```bash
cd server
npm start
```

## 4. Test Payment

1. Add items to cart
2. Go to checkout
3. Fill in shipping info
4. Click "Place Order"
5. Use test card: `4242 4242 4242 4242`
6. Complete payment
7. Order will be created automatically!

## Test Cards

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Any future date, any CVC, any ZIP**

## Done! 🎉

Your Stripe integration is ready. See `STRIPE_SETUP.md` for more details.

