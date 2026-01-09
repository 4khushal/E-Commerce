# ⚡ Quick Fix: "Payment service is not available" Error

## 🔴 The Problem

You're seeing: **"Payment service is not available. Please contact support."**

This happens because `VITE_API_URL` is not set in your Vercel production environment.

## ✅ The Solution (5 Minutes)

### Option 1: Deploy Backend to Vercel (Recommended - Free)

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Click "Add New..." → "Project"**
3. **Import your repo**: `4khushal/E-Commerce`
4. **Configure**:
   - Project Name: `react-ecommerce-backend`
   - Framework: **"Other"** (NOT Vite)
   - Build Command: Leave empty
   - Output Directory: Leave empty
5. **Add Environment Variables**:
   ```
   NODE_ENV = production
   FRONTEND_URL = https://your-frontend.vercel.app
   ADMIN_URL = https://your-admin.vercel.app
   STRIPE_SECRET_KEY = sk_live_your_key
   STRIPE_WEBHOOK_SECRET = whsec_your_secret
   ```
6. **Deploy** → Wait 2-3 minutes
7. **Copy your backend URL**: `https://your-backend-name.vercel.app`

8. **Update Frontend**:
   - Go to your **frontend Vercel project**
   - Settings → Environment Variables
   - Add: `VITE_API_URL` = `https://your-backend-name.vercel.app`
   - Redeploy frontend

✅ **Done!** Checkout should work now.

### Option 2: Deploy Backend to Railway (Alternative)

1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Select `server` directory
4. Add environment variables
5. Deploy → Get your URL
6. Set `VITE_API_URL` in Vercel frontend project
7. Redeploy

## 🔍 Verify It's Fixed

1. Open your frontend in browser
2. Open console (F12)
3. Try to place an order
4. Check console - should show:
   ```
   🔍 API URL: https://your-backend.vercel.app
   ```
   (NOT localhost!)

5. Checkout should work! 🎉

## 📋 What You Need

- ✅ Vercel account (you have this)
- ✅ Stripe Live keys (get from https://dashboard.stripe.com)
- ✅ 5 minutes to deploy

## 🆘 Still Not Working?

1. **Check Vercel Logs**: 
   - Go to your frontend project → Deployments → Latest → View logs
   - Look for errors

2. **Verify Environment Variable**:
   - Settings → Environment Variables
   - Make sure `VITE_API_URL` is set
   - Make sure it's NOT `http://localhost:3002`
   - Make sure it starts with `https://`

3. **Redeploy**:
   - After adding `VITE_API_URL`, you MUST redeploy
   - Go to Deployments → Click "..." → Redeploy

4. **Test Backend**:
   - Visit: `https://your-backend-url.vercel.app/health`
   - Should return: `{"status":"ok",...}`

---

**Need detailed instructions?** See `DEPLOY_BACKEND_NOW.md`
