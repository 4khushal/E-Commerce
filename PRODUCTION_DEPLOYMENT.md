# Production Deployment Guide

This guide will help you deploy your React Ecommerce application to production.

## Prerequisites

- Vercel account (for frontend deployment)
- Supabase production project
- Stripe production account
- Node.js server hosting (Railway, Render, Heroku, or similar)

## Step 1: Environment Variables Setup

### Frontend Environment Variables (.env)

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
VITE_FRONTEND_URL=https://your-domain.com
```

### Backend Environment Variables (server/.env)

Create a `.env` file in the `server` directory:

```env
NODE_ENV=production
PORT=3002
FRONTEND_URL=https://your-domain.com
ADMIN_URL=https://admin.your-domain.com
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

## Step 2: Supabase Production Setup

1. **Create Production Project**
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Create a new project for production
   - Note down your project URL and anon key

2. **Run Database Schema**
   - Copy your `supabase-schema.sql` content
   - Run it in Supabase SQL Editor
   - Run all fix scripts:
     - `fix-admin-products-access.sql`
     - `fix-admin-orders-access.sql`
     - `fix-admin-profiles-access.sql`

3. **Configure RLS Policies**
   - Ensure Row Level Security is enabled
   - Verify all policies are in place

4. **Storage Setup**
   - Create a storage bucket for product images
   - Set up public access policies
   - Configure CORS if needed

## Step 3: Stripe Production Setup

1. **Get Production Keys**
   - Log in to [Stripe Dashboard](https://dashboard.stripe.com)
   - Switch to "Live mode"
   - Go to Developers → API keys
   - Copy your Live publishable key and secret key

2. **Configure Webhooks**
   - Go to Developers → Webhooks
   - Add endpoint: `https://your-backend-url.com/api/stripe-webhook`
   - Select events:
     - `checkout.session.completed`
     - `payment_intent.succeeded`
   - Copy the webhook signing secret

3. **Update Environment Variables**
   - Add `STRIPE_SECRET_KEY` (sk_live_...)
   - Add `STRIPE_WEBHOOK_SECRET` (whsec_...)
   - Update `VITE_STRIPE_PUBLISHABLE_KEY` (pk_live_...)

## Step 4: Deploy Frontend to Vercel

### Option A: Deploy User Dashboard (Port 3000)

1. **Install Vercel CLI** (if not installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

4. **Set Environment Variables in Vercel Dashboard**:
   - Go to your project settings
   - Add all `VITE_*` variables from `.env.example`

### Option B: Deploy Admin Dashboard (Port 3001)

1. **Create separate Vercel project** for admin:
   ```bash
   cd your-project
   vercel --prod --name your-admin-app
   ```

2. **Update build command** in Vercel:
   - Build Command: `npm run build:admin`
   - Output Directory: `dist-admin`

3. **Set same environment variables** as user dashboard

### Using Vercel Dashboard:

1. Go to [Vercel Dashboard](https://vercel.com)
2. Click "New Project"
3. Import your Git repository
4. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build` (or `npm run build:admin` for admin)
   - **Output Directory**: `dist` (or `dist-admin` for admin)
   - **Install Command**: `npm install`
5. Add environment variables
6. Deploy

## Step 5: Deploy Backend Server

### Option A: Railway

1. Go to [Railway](https://railway.app)
2. Create new project
3. Connect your repository
4. Add service → Select `server` directory
5. Set environment variables
6. Deploy

### Option B: Render

1. Go to [Render](https://render.com)
2. Create new Web Service
3. Connect repository
4. Configure:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Add environment variables
6. Deploy

### Option C: Heroku

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Set environment variables:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set STRIPE_SECRET_KEY=sk_live_...
   # ... add all other variables
   ```
5. Deploy: `git push heroku main`

## Step 6: Update Frontend URLs

After deploying backend, update frontend environment variables:

1. Update `VITE_FRONTEND_URL` to your Vercel URL
2. Update backend `FRONTEND_URL` to match
3. Update Stripe webhook URL to your backend URL

## Step 7: Security Checklist

- [ ] All environment variables are set in production
- [ ] Stripe webhook secret is configured
- [ ] CORS is properly configured on backend
- [ ] HTTPS is enabled (Vercel provides this automatically)
- [ ] Supabase RLS policies are in place
- [ ] No console.log statements in production (handled by build config)
- [ ] API keys are not exposed in client-side code
- [ ] Backend has rate limiting enabled

## Step 8: Performance Optimizations

Already implemented:
- ✅ Code splitting (manual chunks)
- ✅ Tree shaking
- ✅ Minification
- ✅ Console removal in production
- ✅ Lazy loading images

Additional recommendations:
- Enable CDN caching
- Use Vercel's Edge Network
- Optimize images before upload
- Monitor bundle sizes

## Step 9: Testing Production

1. **Test User Dashboard**:
   - Visit your Vercel URL
   - Test login/signup
   - Test product browsing
   - Test cart functionality
   - Test checkout flow

2. **Test Admin Dashboard**:
   - Visit admin URL
   - Test admin login
   - Test product management
   - Test order management

3. **Test Backend**:
   - Test health endpoint: `https://your-backend.com/health`
   - Test Stripe webhook
   - Test API endpoints

## Step 10: Monitoring

- Set up error tracking (Sentry, LogRocket, etc.)
- Monitor Stripe dashboard for payments
- Monitor Supabase dashboard for database usage
- Set up uptime monitoring

## Troubleshooting

### CORS Errors
- Verify `FRONTEND_URL` and `ADMIN_URL` in backend `.env`
- Check CORS configuration in `server/server.js`

### Stripe Webhook Not Working
- Verify webhook secret is correct
- Check webhook endpoint URL
- Verify webhook events are selected

### Environment Variables Not Working
- Restart Vercel deployment after adding variables
- Verify variable names start with `VITE_` for frontend
- Check variable names match exactly

## Support

For issues, check:
- Vercel documentation: https://vercel.com/docs
- Supabase documentation: https://supabase.com/docs
- Stripe documentation: https://stripe.com/docs
