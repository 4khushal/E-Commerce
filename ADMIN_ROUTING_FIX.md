# Admin Dashboard Routing Fix

## The Problem

When accessing `/admin/orders` directly (or refreshing the page), you get a 404 error because Vite dev server needs to handle client-side routing.

## Solution

Vite should handle this automatically, but if you're getting 404 errors:

### Option 1: Access via Navigation (Recommended)

Instead of typing the URL directly, use the navigation:
1. Go to: `http://localhost:3001`
2. Login at: `http://localhost:3001/admin/login`
3. Click "Orders" in the admin sidebar

### Option 2: Restart Admin Server

If you're still getting 404 errors:

1. **Stop the admin server** (Ctrl+C in the terminal)
2. **Restart it**:
   ```bash
   npm run dev:admin
   ```
3. **Wait for it to fully start** (you'll see "Local: http://localhost:3001")
4. **Then access**: `http://localhost:3001/admin/login`

### Option 3: Use React Router Navigation

Always navigate using React Router links, not direct URL access:
- ✅ Use: Click "Orders" link in sidebar
- ❌ Avoid: Typing `http://localhost:3001/admin/orders` directly

## Current Setup

- **Admin Dashboard**: `http://localhost:3001` (Vite dev server)
- **SMS Server**: `http://localhost:3002` (Express backend)
- **User App**: `http://localhost:3000` (Vite dev server)

## Troubleshooting

**If you still get 404:**
1. Make sure admin server is running: `npm run dev:admin`
2. Check browser console for errors
3. Try accessing root first: `http://localhost:3001`
4. Then navigate using the UI, not direct URLs

**If routes don't work after login:**
- Check if you're logged in as admin
- Verify admin credentials in database
- Check browser console for authentication errors

