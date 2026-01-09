# Mobile "Load Failed" Troubleshooting Guide

## 🔍 How to Debug

### Step 1: Check Browser Console

On mobile, open the browser console to see detailed error logs:

**Chrome Mobile:**
1. Connect phone to computer via USB
2. Open Chrome on computer → `chrome://inspect`
3. Click "inspect" on your device
4. Check Console tab for errors

**Safari Mobile (iOS):**
1. Enable Web Inspector: Settings → Safari → Advanced → Web Inspector
2. Connect to Mac
3. Open Safari on Mac → Develop → [Your Device] → [Your Site]
4. Check Console

### Step 2: Check Network Tab

In browser DevTools:
1. Go to Network tab
2. Try placing an order
3. Look for failed requests (red)
4. Check:
   - Request URL
   - Status code
   - Error message
   - Response body

### Step 3: Verify Environment Variables

**In Vercel:**
1. Go to Project Settings → Environment Variables
2. Verify these are set:
   - `VITE_API_URL` = Your backend URL (e.g., `https://your-backend.railway.app`)
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_STRIPE_PUBLISHABLE_KEY`

**Important:** `VITE_API_URL` must be your **production backend URL**, not `localhost`!

### Step 4: Check Backend CORS

**In your backend `.env` file:**
```env
FRONTEND_URL=https://your-frontend.vercel.app
ADMIN_URL=https://your-admin.vercel.app
NODE_ENV=production
```

**Verify backend is running:**
- Test: `https://your-backend-url.com/health`
- Should return: `{"status":"ok",...}`

### Step 5: Check Console Logs

The app now logs detailed information. Look for:
- `🔍 Fetching session from:` - Shows the API URL being used
- `📡 Response status:` - Shows HTTP status code
- `❌ Error:` - Shows the actual error

## 🐛 Common Issues & Fixes

### Issue 1: "Failed to fetch" or "NetworkError"

**Cause:** Backend not accessible or CORS issue

**Fix:**
1. Verify backend is deployed and running
2. Check `VITE_API_URL` in Vercel environment variables
3. Verify backend CORS allows your Vercel domain
4. Check backend logs for errors

### Issue 2: "Request timed out"

**Cause:** Slow mobile network or backend not responding

**Fix:**
1. Check backend is running: `https://your-backend-url.com/health`
2. Check backend logs for slow queries
3. Try on WiFi instead of mobile data
4. Increase timeout (already set to 20 seconds)

### Issue 3: "CORS error"

**Cause:** Backend CORS not configured correctly

**Fix:**
1. Update backend `.env`:
   ```env
   FRONTEND_URL=https://your-frontend.vercel.app
   ```
2. Restart backend server
3. Verify CORS allows Vercel domains (`.vercel.app`)

### Issue 4: "Status: 404"

**Cause:** Session not found or expired

**Fix:**
1. Session might have expired (Stripe sessions expire)
2. Check if session ID is correct
3. Verify Stripe webhook is working

### Issue 5: "Status: 500"

**Cause:** Backend server error

**Fix:**
1. Check backend logs
2. Verify Stripe keys are correct
3. Check database connection

## ✅ Quick Checklist

- [ ] `VITE_API_URL` is set in Vercel (not localhost)
- [ ] Backend is deployed and running
- [ ] Backend `/health` endpoint works
- [ ] Backend CORS allows your Vercel domain
- [ ] `FRONTEND_URL` is set in backend `.env`
- [ ] Backend is accessible from mobile network
- [ ] Stripe keys are correct
- [ ] Database is accessible

## 🔧 Test Backend Manually

Test the endpoint directly:

```bash
curl https://your-backend-url.com/api/checkout-session/YOUR_SESSION_ID
```

Should return JSON with session data.

## 📱 Mobile-Specific Issues

### Slow Network
- The app now retries 3 times with exponential backoff
- Timeout increased to 20 seconds
- Better error messages

### Different User Agents
- CORS now allows Vercel domains automatically
- Handles requests with no origin

### Browser Differences
- Added explicit CORS mode
- Better error detection

## 🆘 Still Not Working?

1. **Check browser console** for detailed error logs
2. **Check network tab** for failed requests
3. **Verify backend is accessible** from mobile network
4. **Check backend logs** for server errors
5. **Test on desktop** to see if it's mobile-specific

## 📞 Support Information

When reporting issues, include:
- Browser console errors
- Network request details
- Backend URL
- Frontend URL
- Error message shown to user
- Device/browser information
