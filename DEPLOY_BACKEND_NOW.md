# 🚀 Deploy Backend to Vercel - Quick Guide

## Step 1: Deploy Backend to Vercel

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Click "Add New..." → "Project"**
3. **Import Git Repository**:
   - Select your repository: `4khushal/E-Commerce`
   - Click "Import"

4. **Configure Project**:
   - **Project Name**: `react-ecommerce-backend` (or any name you like)
   - **Framework Preset**: Select **"Other"** (NOT Vite)
   - **Root Directory**: Leave as `./` (root)
   - **Build Command**: Leave empty
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

5. **Add Environment Variables** (BEFORE deploying):
   
   Click "Environment Variables" and add these:
   
   ```
   NODE_ENV = production
   FRONTEND_URL = https://your-frontend.vercel.app
   ADMIN_URL = https://your-admin.vercel.app
   STRIPE_SECRET_KEY = sk_live_your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET = whsec_your_webhook_secret
   ```
   
   **Important**: 
   - For `FRONTEND_URL` and `ADMIN_URL`, use your actual Vercel frontend URLs
   - If you don't have them yet, you can update these after deployment
   - For `STRIPE_SECRET_KEY`, use your Stripe Live secret key (starts with `sk_live_`)
   - For `STRIPE_WEBHOOK_SECRET`, get it from Stripe Dashboard → Webhooks
   
   **For each variable**:
   - Select all environments: ✅ Production, ✅ Preview, ✅ Development
   - Click "Add"

6. **Configure Vercel.json**:
   - Go to **Settings → General**
   - Scroll down to find "Override" section
   - OR: The `vercel-backend.json` file should work automatically
   - If needed, rename `vercel-backend.json` to `vercel.json` (but only for this backend project!)

7. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete
   - Your backend will be live at: `https://your-backend-name.vercel.app`

## Step 2: Test Your Backend

After deployment, test these URLs:

1. **Health Check**: 
   ```
   https://your-backend-name.vercel.app/health
   ```
   Should return: `{"status":"ok","message":"Ecommerce Backend API Server is running"}`

2. **Root Endpoint**:
   ```
   https://your-backend-name.vercel.app/
   ```
   Should return API information

## Step 3: Update Frontend with Backend URL

1. **Go to your frontend project** in Vercel Dashboard
2. **Settings → Environment Variables**
3. **Add/Update**:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-backend-name.vercel.app` (your actual backend URL)
   - **Environments**: Select all (Production, Preview, Development)
4. **Click "Save"**
5. **Redeploy**: Go to Deployments → Click "..." → Redeploy

## Step 4: Update Admin Dashboard (if you have one)

1. **Go to your admin project** in Vercel Dashboard
2. **Settings → Environment Variables**
3. **Add/Update**:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-backend-name.vercel.app`
   - **Environments**: Select all
4. **Redeploy** admin dashboard

## Step 5: Verify It Works

1. **Open your frontend** in browser
2. **Open browser console** (F12)
3. **Try to place an order**
4. **Check console** - you should see:
   ```
   🔍 API URL: https://your-backend-name.vercel.app
   ```
   (NOT localhost!)

5. **Checkout should work now!** ✅

## ⚠️ Important Notes

### If You Don't Have Stripe Keys Yet:

You can deploy the backend first, then add Stripe keys later:

1. Deploy backend without `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`
2. Get your Stripe keys from https://dashboard.stripe.com
3. Add them to Vercel environment variables
4. Redeploy backend

### If You Don't Have Frontend URLs Yet:

1. Deploy backend first with placeholder URLs:
   ```
   FRONTEND_URL = https://placeholder.vercel.app
   ADMIN_URL = https://placeholder.vercel.app
   ```
2. After deploying frontend, update these URLs
3. Redeploy backend

### Stripe Webhook Setup:

After backend is deployed:

1. Go to Stripe Dashboard → Webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://your-backend-name.vercel.app/api/stripe-webhook`
4. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
5. Copy the webhook secret
6. Add `STRIPE_WEBHOOK_SECRET` to Vercel environment variables
7. Redeploy backend

## 🆘 Troubleshooting

### Backend Returns 404

- Check that `api/index.js` exists
- Verify Vercel detected the `api/` folder
- Check Vercel deployment logs

### CORS Errors

- Make sure `FRONTEND_URL` and `ADMIN_URL` are set correctly
- They should match your actual Vercel frontend URLs
- Redeploy backend after updating

### Build Fails

- Check Vercel logs for errors
- Make sure all dependencies are in `package.json`
- Verify `server/routes/` files exist

## ✅ Checklist

- [ ] Backend deployed to Vercel
- [ ] Health check works: `/health` returns OK
- [ ] Environment variables set in backend project
- [ ] `VITE_API_URL` set in frontend project
- [ ] Frontend redeployed after adding `VITE_API_URL`
- [ ] Test checkout - console shows correct API URL
- [ ] Checkout works! 🎉

---

**Your backend URL will be**: `https://your-backend-name.vercel.app`

Use this URL for `VITE_API_URL` in your frontend! 🚀
