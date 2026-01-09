# Deploy Backend to Vercel - Complete Guide

## 🎯 Overview

This guide will help you deploy your Express backend as a Vercel serverless function.

## 📋 Prerequisites

- Your code is pushed to GitHub
- You have a Vercel account
- Stripe keys ready
- Supabase keys ready

## 🚀 Step-by-Step Deployment

### Step 1: Create New Vercel Project for Backend

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Click "Add New..." → "Project"**
3. **Import Git Repository**:
   - Select `4khushal/E-Commerce` from the list
   - Click "Import"

### Step 2: Configure Backend Project

**Important Settings:**

- **Project Name**: `react-ecommerce-backend` (or your preferred name)
- **Framework Preset**: Select "Other" (not Vite)
- **Root Directory**: Leave as `./` (root)
- **Build Command**: Leave empty (or `npm install`)
- **Output Directory**: Leave empty
- **Install Command**: `npm install`

### Step 3: Add Environment Variables

Click "Environment Variables" and add:

```
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app
ADMIN_URL=https://your-admin.vercel.app
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
TWILIO_ACCOUNT_SID=your_twilio_account_sid (optional)
TWILIO_AUTH_TOKEN=your_twilio_auth_token (optional)
TWILIO_PHONE_NUMBER=your_twilio_phone_number (optional)
```

**For each variable:**
- Select all environments: Production, Preview, Development
- Click "Add"

### Step 4: Configure Vercel for Backend

After importing, you need to configure it:

1. **Go to Settings → General**
2. **Override Build Settings**:
   - Build Command: Leave empty
   - Output Directory: Leave empty
   - Install Command: `npm install`

3. **Or use vercel.json** (already created):
   - The `vercel-backend.json` file is configured
   - Rename it to `vercel.json` in a separate branch, OR
   - Manually configure in Vercel dashboard

### Step 5: Deploy

1. Click "Deploy"
2. Wait for build to complete (2-3 minutes)
3. Your backend will be live at: `https://your-backend.vercel.app`

### Step 6: Update Frontend Environment Variables

1. **Go to your frontend project** in Vercel
2. **Settings → Environment Variables**
3. **Add/Update**:
   - `VITE_API_URL` = `https://your-backend.vercel.app`
4. **Redeploy** frontend

### Step 7: Update Admin Dashboard Environment Variables

1. **Go to your admin project** in Vercel
2. **Settings → Environment Variables**
3. **Add/Update**:
   - `VITE_API_URL` = `https://your-backend.vercel.app`
4. **Redeploy** admin dashboard

## 🔧 Alternative: Use Separate Repository/Branch

If you want to keep backend separate:

### Option A: Create Separate Branch

1. Create a new branch: `backend-vercel`
2. Move `api/` folder to root
3. Add `vercel.json` for backend
4. Deploy that branch to Vercel

### Option B: Use Root Directory Override

In Vercel project settings:
- Set **Root Directory** to project root
- Vercel will automatically detect the `api/` folder
- Use the `vercel-backend.json` configuration

## 📝 Vercel Configuration

The backend uses `api/index.js` as the entry point. Vercel automatically:
- Detects `api/` folder
- Converts it to serverless functions
- Routes all requests to `/api/index.js`

## ✅ Verify Deployment

### Test Backend

1. **Health Check**: `https://your-backend.vercel.app/health`
   - Should return: `{"status":"ok",...}`

2. **Root Endpoint**: `https://your-backend.vercel.app/`
   - Should return API information

3. **Test from Frontend**:
   - Try placing an order
   - Check browser console for API calls
   - Should show: `🔍 API URL: https://your-backend.vercel.app`

## 🔍 Troubleshooting

### Build Fails

**Error: "Cannot find module"**
- Make sure `api/index.js` exists
- Check that all dependencies are in `package.json`
- Verify `server/routes/` files exist

**Error: "Module not found"**
- Run `npm install` in root directory
- Make sure `server/` folder dependencies are installed

### API Returns 404

**Check:**
- `api/index.js` exists
- Routes are properly configured
- Vercel detected the `api/` folder

### CORS Errors

**Fix:**
- Update `FRONTEND_URL` in backend environment variables
- Update `ADMIN_URL` in backend environment variables
- Redeploy backend

## 📊 Project Structure

```
react-ecommerce/
├── api/
│   └── index.js          # Vercel serverless function entry
├── server/
│   ├── routes/
│   │   ├── stripe.js
│   │   └── notifications.js
│   └── server.js         # Original server (for local dev)
├── vercel-backend.json   # Backend Vercel config
└── package.json
```

## 🎯 Summary

1. ✅ Create new Vercel project for backend
2. ✅ Import your GitHub repo
3. ✅ Add environment variables
4. ✅ Deploy
5. ✅ Update `VITE_API_URL` in frontend projects
6. ✅ Test!

## 💡 Pro Tips

- **Separate Projects**: Keep frontend, admin, and backend as separate Vercel projects
- **Environment Variables**: Use same Stripe/Supabase keys across all projects
- **Monitoring**: Check Vercel logs if API calls fail
- **Testing**: Test `/health` endpoint first before testing full flow

---

**Your backend is now on Vercel!** 🎉
