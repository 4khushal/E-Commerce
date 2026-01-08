# Quick Deployment Guide

## 🚀 Fast Track to Production

### Step 1: Set Up Environment Variables

#### Frontend (.env)
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_key
VITE_FRONTEND_URL=https://your-app.vercel.app
VITE_API_URL=https://your-backend.railway.app
```

#### Backend (server/.env)
```env
NODE_ENV=production
PORT=3002
FRONTEND_URL=https://your-app.vercel.app
ADMIN_URL=https://admin-app.vercel.app
STRIPE_SECRET_KEY=sk_live_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
```

### Step 2: Deploy Frontend (Vercel)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy User Dashboard**:
   ```bash
   vercel --prod
   ```

3. **Deploy Admin Dashboard** (separate project):
   ```bash
   vercel --prod --name your-admin-app
   ```
   - Set build command: `npm run build:admin`
   - Set output directory: `dist-admin`

4. **Add Environment Variables** in Vercel dashboard for both projects

### Step 3: Deploy Backend

#### Option A: Railway (Recommended)
1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Select `server` directory
4. Add environment variables
5. Deploy

#### Option B: Render
1. Go to [render.com](https://render.com)
2. New Web Service
3. Connect repo, set root: `server`
4. Add environment variables
5. Deploy

### Step 4: Configure Stripe Webhook

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-backend-url.com/api/stripe-webhook`
3. Select events: `checkout.session.completed`, `payment_intent.succeeded`
4. Copy webhook secret to backend `.env`

### Step 5: Update URLs

After deployment, update:
- Frontend `VITE_API_URL` → Your backend URL
- Backend `FRONTEND_URL` → Your frontend URL
- Backend `ADMIN_URL` → Your admin URL
- Stripe webhook URL → Your backend URL

### Step 6: Test

- [ ] User dashboard loads
- [ ] Admin dashboard loads
- [ ] Products display
- [ ] Checkout works
- [ ] Payment processes
- [ ] Orders appear in admin

## 📝 Files Created

- `vercel.json` - Vercel config for user dashboard
- `vercel-admin.json` - Vercel config for admin dashboard
- `railway.json` - Railway deployment config
- `render.yaml` - Render deployment config
- `PRODUCTION_DEPLOYMENT.md` - Full deployment guide
- `DEPLOYMENT_CHECKLIST.md` - Pre-deployment checklist
- `ENV_SETUP.md` - Environment variables guide
- `SECURITY.md` - Security best practices

## ⚠️ Important Notes

1. **Never commit `.env` files** - They're in `.gitignore`
2. **Use production Stripe keys** - Switch to Live mode
3. **Test webhooks** - Verify Stripe webhook works
4. **Monitor errors** - Set up error tracking
5. **Backup database** - Regular Supabase backups

## 🆘 Troubleshooting

**CORS Errors**: Check `FRONTEND_URL` and `ADMIN_URL` in backend
**Webhook Fails**: Verify `STRIPE_WEBHOOK_SECRET` is correct
**Build Fails**: Check environment variables in Vercel
**API Not Working**: Verify `VITE_API_URL` is set correctly
