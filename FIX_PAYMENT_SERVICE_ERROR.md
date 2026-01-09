# Fix: "Payment Service is Not Configured" Error

## 🔴 The Problem

You're seeing: **"Payment service is not configured. Please contact support."**

This means `VITE_API_URL` is either:
- ❌ Not set in Vercel environment variables
- ❌ Set to `http://localhost:3002` (won't work in production)
- ❌ Empty or undefined

## ✅ The Solution

### Step 1: Deploy Your Backend (If Not Done)

You need a backend server running. Options:

**Option A: Railway (Recommended)**
1. Go to https://railway.app
2. Create new project
3. Deploy from GitHub → Select your repo
4. Set root directory to `server`
5. Add environment variables (see Step 2)
6. Deploy

**Option B: Render**
1. Go to https://render.com
2. New Web Service
3. Connect your GitHub repo
4. Set root directory: `server`
5. Build command: `npm install`
6. Start command: `node server.js`
7. Add environment variables

**Option C: Heroku**
1. Install Heroku CLI
2. `heroku create your-app-name`
3. `cd server`
4. `git subtree push --prefix server heroku main`
5. Add environment variables

### Step 2: Get Your Backend URL

After deploying, you'll get a URL like:
- Railway: `https://your-app.railway.app`
- Render: `https://your-app.onrender.com`
- Heroku: `https://your-app.herokuapp.com`

**Test it:** Open `https://your-backend-url.com/health` in browser
- Should return: `{"status":"ok",...}`

### Step 3: Set VITE_API_URL in Vercel

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project** (the user dashboard, not admin)
3. **Go to Settings** → **Environment Variables**
4. **Add New Variable**:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-backend-url.railway.app` (your actual backend URL)
   - **Environments**: Select all (Production, Preview, Development)
5. **Click "Save"**
6. **Redeploy** your project (or wait for auto-redeploy)

### Step 4: Verify Backend Environment Variables

In your backend server (Railway/Render/Heroku), make sure these are set:

```env
NODE_ENV=production
PORT=3002 (or your platform's assigned port)
FRONTEND_URL=https://your-frontend.vercel.app
ADMIN_URL=https://your-admin.vercel.app
STRIPE_SECRET_KEY=sk_live_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### Step 5: Test

1. Wait for Vercel to redeploy (1-2 minutes)
2. Try placing an order again
3. The error should be gone!

## 🔍 How to Verify It's Fixed

### Check 1: Browser Console
Open browser console and look for:
```
🔍 API URL: https://your-backend-url.railway.app
```
Should NOT show `localhost`!

### Check 2: Network Tab
1. Open browser DevTools → Network tab
2. Try to place an order
3. Look for request to: `https://your-backend-url.com/api/create-checkout-session`
4. Should return 200 status (not 404 or error)

### Check 3: Backend Health
Visit: `https://your-backend-url.com/health`
Should return: `{"status":"ok",...}`

## ⚠️ Common Mistakes

### Mistake 1: Using localhost
❌ `VITE_API_URL=http://localhost:3002`
✅ `VITE_API_URL=https://your-backend.railway.app`

### Mistake 2: Missing https://
❌ `VITE_API_URL=your-backend.railway.app`
✅ `VITE_API_URL=https://your-backend.railway.app`

### Mistake 3: Wrong project
- Make sure you're adding the variable to the **user dashboard** project
- Not the admin dashboard (though it needs it too)

### Mistake 4: Not redeploying
- After adding environment variables, Vercel needs to redeploy
- Go to Deployments → Click "..." → Redeploy

## 📝 Quick Checklist

- [ ] Backend is deployed (Railway/Render/Heroku)
- [ ] Backend `/health` endpoint works
- [ ] `VITE_API_URL` is set in Vercel (user dashboard project)
- [ ] `VITE_API_URL` value is your backend URL (not localhost)
- [ ] Vercel project has been redeployed after adding variable
- [ ] Backend CORS allows your Vercel domain
- [ ] Backend environment variables are set

## 🆘 Still Not Working?

1. **Check Vercel logs**:
   - Go to Deployments → Click latest deployment → View logs
   - Look for any errors

2. **Check backend logs**:
   - Railway: View logs in dashboard
   - Render: View logs in dashboard
   - Look for CORS errors or other issues

3. **Test backend directly**:
   ```bash
   curl https://your-backend-url.com/health
   ```

4. **Verify environment variable**:
   - In Vercel, check that `VITE_API_URL` is actually set
   - Make sure it's not in a different environment (Production vs Preview)

## 💡 Pro Tip

After setting `VITE_API_URL`, you can verify it's working by:
1. Opening your deployed site
2. Opening browser console
3. Type: `import.meta.env.VITE_API_URL`
4. Should show your backend URL (not localhost)

---

**TL;DR**: Set `VITE_API_URL` in Vercel to your deployed backend URL (not localhost)!
