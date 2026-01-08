# Deploy to Vercel - Step by Step Guide

## 🚀 Method 1: Using Vercel Dashboard (Recommended - Easiest)

### Step 1: Prepare Your GitHub Repository

1. Make sure your code is pushed to GitHub (already done ✅)
2. Your repository: https://github.com/4khushal/E-Commerce

### Step 2: Deploy User Dashboard (Port 3000)

1. **Go to Vercel Dashboard**:
   - Visit: https://vercel.com
   - Sign in with GitHub (if not already)

2. **Create New Project**:
   - Click "Add New..." → "Project"
   - Click "Import Git Repository"
   - Select `4khushal/E-Commerce` from the list
   - Click "Import"

3. **Configure Project Settings**:
   - **Project Name**: `react-ecommerce` (or your preferred name)
   - **Framework Preset**: Select "Vite" (Vercel will auto-detect)
   - **Root Directory**: Leave as `./` (root)
   - **Build Command**: `npm run build` (auto-detected by Vercel)
   - **Output Directory**: `dist` (auto-detected by Vercel)
   - **Install Command**: `npm install` (auto-detected by Vercel)
   
   ⚠️ **Note**: The `vercel.json` file uses modern configuration, so Vercel will automatically detect these settings. You can leave them as default.

4. **Add Environment Variables**:
   - Click "Environment Variables" section
   - Click "Add" for each variable:
   
   **Variable 1:**
   - Name: `VITE_SUPABASE_URL`
   - Value: `your_supabase_project_url` (e.g., `https://xxxxx.supabase.co`)
   - Environments: Select all (Production, Preview, Development)
   
   **Variable 2:**
   - Name: `VITE_SUPABASE_ANON_KEY`
   - Value: `your_supabase_anon_key`
   - Environments: Select all
   
   **Variable 3:**
   - Name: `VITE_STRIPE_PUBLISHABLE_KEY`
   - Value: `pk_live_your_stripe_key` (or `pk_test_...` for testing)
   - Environments: Select all
   
   **Variable 4:**
   - Name: `VITE_FRONTEND_URL`
   - Value: Leave empty for now (will update after first deploy)
   - Environments: Select all
   
   **Variable 5:**
   - Name: `VITE_API_URL`
   - Value: `https://your-backend-url.railway.app` (your backend URL)
   - Environments: Select all
   
   ⚠️ **Important**: Add these variables BEFORE clicking "Deploy"

5. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete (2-3 minutes)
   - Your app will be live at: `https://your-app.vercel.app`

### Step 3: Deploy Admin Dashboard (Port 3001)

1. **Create Second Project**:
   - Click "Add New..." → "Project" again
   - Import the same repository: `4khushal/E-Commerce`

2. **Configure Admin Project**:
   - **Project Name**: `react-ecommerce-admin` (or your preferred name)
   - **Framework Preset**: Select "Vite" (or "Other")
   - **Root Directory**: Leave as `./` (root)
   - **Build Command**: `npm run build:admin`
   - **Output Directory**: `dist-admin`
   - **Install Command**: `npm install`

3. **Add Environment Variables**:
   Use the same environment variables as the user dashboard, PLUS add one more:
   ```
   VITE_SUPABASE_URL = your_supabase_project_url
   VITE_SUPABASE_ANON_KEY = your_supabase_anon_key
   VITE_STRIPE_PUBLISHABLE_KEY = pk_live_your_stripe_key
   VITE_FRONTEND_URL = https://your-app.vercel.app
   VITE_API_URL = https://your-backend-url.railway.app
   VITE_IS_ADMIN = true  ⚠️ IMPORTANT: Add this for admin dashboard!
   ```
   
   ⚠️ **Critical**: The `VITE_IS_ADMIN = true` variable tells the app this is the admin build!

4. **Deploy**:
   - Click "Deploy"
   - Your admin dashboard will be live at: `https://your-admin-app.vercel.app`

---

## 🛠️ Method 2: Using Vercel CLI

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```
- This will open your browser to authenticate

### Step 3: Deploy User Dashboard

```bash
cd c:\react-ecommerce
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? Select your account
- Link to existing project? **No**
- Project name? `react-ecommerce`
- Directory? `./`
- Override settings? **No** (or Yes to customize)

After first deployment, deploy to production:
```bash
vercel --prod
```

### Step 4: Add Environment Variables (CLI)

```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_STRIPE_PUBLISHABLE_KEY
vercel env add VITE_FRONTEND_URL
vercel env add VITE_API_URL
```

For each variable, select:
- **Environment**: Production, Preview, Development (select all)

### Step 5: Deploy Admin Dashboard (CLI)

Create a separate project for admin:
```bash
vercel --prod --name react-ecommerce-admin
```

Then update build settings in Vercel dashboard:
- Build Command: `npm run build:admin`
- Output Directory: `dist-admin`

---

## 📝 Important Notes

### Environment Variables

You need to get these values:

1. **Supabase**:
   - Go to: https://app.supabase.com
   - Select your project
   - Settings → API
   - Copy: Project URL and anon key

2. **Stripe**:
   - Go to: https://dashboard.stripe.com
   - Switch to **Live mode**
   - Developers → API keys
   - Copy: Publishable key

3. **Backend URL**:
   - Deploy backend first (Railway/Render)
   - Use that URL for `VITE_API_URL`

### After First Deployment

1. **Update VITE_FRONTEND_URL**:
   - After first deploy, Vercel gives you a URL
   - Update `VITE_FRONTEND_URL` in environment variables
   - Redeploy

2. **Update Backend CORS**:
   - Update `FRONTEND_URL` in backend `.env`
   - Update `ADMIN_URL` in backend `.env`
   - Restart backend server

### Custom Domains (Optional)

1. Go to project settings in Vercel
2. Click "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] User dashboard loads: `https://your-app.vercel.app`
- [ ] Admin dashboard loads: `https://your-admin-app.vercel.app`
- [ ] Products display correctly
- [ ] Login/Register works
- [ ] Cart functionality works
- [ ] Checkout works (test with Stripe test card)
- [ ] Orders appear in admin dashboard

---

## 🆘 Troubleshooting

### Build Fails

**Error: "Module not found"**
- Check if all dependencies are in `package.json`
- Run `npm install` locally to verify

**Error: "Environment variable not found"**
- Make sure all `VITE_*` variables are set in Vercel
- Redeploy after adding variables

### App Doesn't Load

**Blank page or 404 errors**
- Check if `Output Directory` is correct (`dist` or `dist-admin`)
- Verify build completed successfully
- Check browser console for errors

### API Calls Fail

**CORS errors**
- Make sure `VITE_API_URL` is set correctly
- Verify backend CORS allows your Vercel URL
- Check backend is running

---

## 🔗 Quick Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Your Repository**: https://github.com/4khushal/E-Commerce
- **Vercel Docs**: https://vercel.com/docs

---

## 📞 Need Help?

1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify all environment variables are set
4. Make sure backend is deployed and running
