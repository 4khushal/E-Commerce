# Admin Dashboard Deployment Guide

## 🎯 Quick Overview

Your app has **two separate dashboards**:
1. **User Dashboard** (Port 3000) - Customer-facing ecommerce site
2. **Admin Dashboard** (Port 3001) - Admin panel for managing products, orders, etc.

Both need to be deployed as **separate Vercel projects**.

---

## 🚀 Deploy Admin Dashboard on Vercel

### Step 1: Create New Vercel Project for Admin

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Click "Add New..." → "Project"**
3. **Import Git Repository**:
   - Select `4khushal/E-Commerce` from the list
   - Click "Import"

### Step 2: Configure Admin Project Settings

**Important**: These settings are different from the user dashboard!

- **Project Name**: `react-ecommerce-admin` (or any name you prefer)
- **Framework Preset**: Select "Vite" (Vercel will auto-detect)
- **Root Directory**: `./` (leave as root)
- **Build Command**: `npm run build:admin` ⚠️ **This is different!**
- **Output Directory**: `dist-admin` ⚠️ **This is different!**
- **Install Command**: `npm install`

### Step 3: Add Environment Variables

Click "Environment Variables" and add the same variables as user dashboard, PLUS one critical variable:

```
VITE_SUPABASE_URL = your_supabase_project_url
VITE_SUPABASE_ANON_KEY = your_supabase_anon_key
VITE_STRIPE_PUBLISHABLE_KEY = pk_live_your_stripe_key
VITE_FRONTEND_URL = https://your-user-dashboard.vercel.app
VITE_API_URL = https://your-backend-url.railway.app
VITE_IS_ADMIN = true  ⚠️ CRITICAL: This tells the app it's the admin build!
```

⚠️ **IMPORTANT**: The `VITE_IS_ADMIN = true` variable is **required** for the admin dashboard to work correctly in production!

**For each variable:**
- Select all environments: Production, Preview, Development
- Click "Add"

### Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete (2-3 minutes)
3. Your admin dashboard will be live at: `https://your-admin-app.vercel.app`

---

## 🧪 Test Admin Dashboard Locally

### Option 1: Run Admin Dashboard Only

```bash
cd c:\react-ecommerce
npm run dev:admin
```

Then open: http://localhost:3001

### Option 2: Run Both Dashboards

**Terminal 1** - User Dashboard:
```bash
cd c:\react-ecommerce
npm run dev
```
Opens: http://localhost:3000

**Terminal 2** - Admin Dashboard:
```bash
cd c:\react-ecommerce
npm run dev:admin
```
Opens: http://localhost:3001

---

## 🔐 Access Admin Dashboard

### After Deployment

1. **Go to your admin dashboard URL**: `https://your-admin-app.vercel.app`
2. **You'll be redirected to**: `/admin/login`
3. **Login with admin credentials**:
   - Email: Your admin email (set in Supabase)
   - Password: Your admin password

### Admin Login Requirements

- You must have an admin account in Supabase
- The email must be in the `profiles` table with `is_admin = true`
- If you don't have admin access, check: `ADMIN_SETUP.md` or `make-admin.sql`

---

## ✅ Verify Admin Dashboard is Working

### Checklist:

- [ ] Admin dashboard loads at the Vercel URL
- [ ] Redirects to `/admin/login` if not authenticated
- [ ] Can login with admin credentials
- [ ] Admin dashboard shows after login
- [ ] Can see products management page
- [ ] Can see orders management page
- [ ] Can see dashboard statistics

### Test Admin Features:

1. **Products Management**:
   - Go to `/admin/products`
   - Should see list of products
   - Can add/edit/delete products

2. **Orders Management**:
   - Go to `/admin/orders`
   - Should see all orders
   - Can view order details
   - Can update order status

3. **Dashboard**:
   - Go to `/admin` (root)
   - Should see statistics and overview

---

## 🔧 Troubleshooting

### Admin Dashboard Shows User Dashboard

**Problem**: Admin dashboard shows the same content as user dashboard

**Solution**: 
- Check that `Build Command` is set to `npm run build:admin`
- Check that `Output Directory` is set to `dist-admin`
- Verify `vite.admin.config.js` exists and has correct config

### Can't Login to Admin

**Problem**: Login page doesn't accept credentials

**Solution**:
1. Check if admin account exists in Supabase:
   ```sql
   SELECT * FROM profiles WHERE is_admin = true;
   ```
2. If no admin account, create one:
   - Run `make-admin.sql` in Supabase SQL Editor
   - Or follow `ADMIN_SETUP.md`

### Build Fails

**Problem**: Admin dashboard build fails on Vercel

**Solution**:
1. Check build logs in Vercel
2. Verify `package.json` has `build:admin` script:
   ```json
   "build:admin": "vite build --config vite.admin.config.js"
   ```
3. Verify `vite.admin.config.js` exists
4. Check environment variables are set correctly

### Wrong Port Detection

**Problem**: Admin dashboard doesn't detect it's on admin port

**Solution**:
- In production (Vercel), the app uses the same codebase
- The `isAdminPort()` function checks `window.location.port`
- On Vercel, both dashboards will work because they're separate deployments
- The routing logic in `App.jsx` handles both cases

---

## 📝 Important Notes

1. **Separate Projects**: Admin and user dashboards are **two separate Vercel projects**
2. **Same Repository**: Both use the same GitHub repo but different build commands
3. **Same Environment Variables**: Both need the same Supabase and Stripe keys
4. **Different URLs**: They'll have different Vercel URLs
5. **Admin Access**: Only users with `is_admin = true` in Supabase can access admin routes

---

## 🔗 Quick Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Your Repository**: https://github.com/4khushal/E-Commerce
- **Admin Setup Guide**: See `ADMIN_SETUP.md`
- **Make Admin SQL**: See `make-admin.sql`

---

## 🆘 Need Help?

1. Check Vercel deployment logs
2. Verify build settings in Vercel project settings
3. Test locally first with `npm run dev:admin`
4. Check browser console for errors
5. Verify admin account exists in Supabase
