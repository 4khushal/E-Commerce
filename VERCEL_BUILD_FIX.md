# 🔧 Fix Vercel Build Error: "vite: command not found"

## The Problem

You're seeing this error when deploying to Vercel:
```
sh: line 1: vite: command not found
Error: Command "npm run build" exited with 127
```

## Root Cause

Vite is in `devDependencies`, and Vercel might not be installing devDependencies properly, or there's a PATH issue.

## ✅ Solution 1: Use npx (Already Fixed)

I've updated `package.json` to use `npx vite build` instead of `vite build`. This ensures Vite is found even if it's not in PATH.

**The fix is already applied** - just commit and push:

```bash
git add package.json
git commit -m "Fix Vercel build: use npx vite build"
git push
```

## ✅ Solution 2: Configure Vercel to Install DevDependencies

If Solution 1 doesn't work, ensure Vercel installs devDependencies:

### Option A: Vercel Dashboard Settings

1. Go to your **Vercel project** → **Settings** → **General**
2. Scroll to **"Build & Development Settings"**
3. Set **"Install Command"** to:
   ```
   npm install
   ```
   (Not `npm ci --production` which skips devDependencies)

### Option B: Add .npmrc file

Create a `.npmrc` file in the root directory:

```
production=false
```

This ensures devDependencies are installed.

## ✅ Solution 3: Move Vite to Dependencies (Not Recommended)

As a last resort, you can move vite to dependencies, but this is not ideal:

```json
"dependencies": {
  "vite": "^5.4.21",
  "@vitejs/plugin-react": "^4.2.1",
  ...
}
```

## 🔍 Verify the Fix

After pushing the changes:

1. **Vercel will auto-redeploy** (if connected to GitHub)
2. **Or manually redeploy**: Go to Deployments → Redeploy
3. **Check build logs** - should see:
   ```
   Running "npm run build"
   > react-ecommerce-app@1.0.0 build
   > npx vite build
   ```
4. **Build should succeed** ✅

## 📋 Quick Checklist

- [ ] Updated `package.json` with `npx vite build` ✅ (Already done)
- [ ] Committed and pushed changes
- [ ] Vercel redeployed
- [ ] Build succeeds
- [ ] Site works in production

## 🆘 Still Not Working?

### Check 1: Verify Vercel Project Type

Make sure you're deploying the **frontend** (not backend) with these settings:
- **Framework Preset**: Vite
- **Build Command**: `npm run build` (or leave empty for auto-detect)
- **Output Directory**: `dist`

### Check 2: Verify Install Command

In Vercel Settings → General → Install Command:
- Should be: `npm install` (not `npm ci --production`)

### Check 3: Check Build Logs

Look for:
- ✅ `added 163 packages` - dependencies installed
- ✅ `Running "npm run build"` - build command executed
- ❌ `vite: command not found` - this should be fixed now

---

**The fix is already applied to `package.json` - just commit and push!** 🚀
