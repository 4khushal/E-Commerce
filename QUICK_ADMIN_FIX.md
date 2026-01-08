# Quick Admin Dashboard Fix

## Step 1: Create Admin Users Table

Run this SQL in Supabase SQL Editor:

```sql
-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Temporarily disable RLS for setup (enable later for security)
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- Insert admin user
INSERT INTO admin_users (email, password_hash, name, is_active)
VALUES ('admin@example.com', 'admin123', 'Admin User', true)
ON CONFLICT (email) DO UPDATE SET password_hash = 'admin123', is_active = true;

-- Verify it was created
SELECT * FROM admin_users;
```

## Step 2: Access Admin Dashboard

1. **Go to:** `http://localhost:3001/admin/login`
2. **Login with:**
   - Email: `admin@example.com`
   - Password: `admin123`

## Step 3: If Still Not Working

### Check Browser Console (F12)
Look for errors like:
- "Table doesn't exist" → Run Step 1 SQL
- "Permission denied" → Disable RLS (see Step 1)
- "Invalid credentials" → Check email/password match

### Verify Table Exists
```sql
SELECT * FROM admin_users WHERE email = 'admin@example.com';
```

### Check Session Storage
After login, open browser console and run:
```javascript
sessionStorage.getItem('admin_session')
```
Should return JSON with admin data.

## Common Issues

1. **"Table doesn't exist"** → Run the SQL from Step 1
2. **"Permission denied"** → Disable RLS temporarily: `ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;`
3. **"Invalid credentials"** → Make sure email and password match exactly
4. **Blank page** → Check browser console for React errors

## After Setup Works

Re-enable RLS for security:
```sql
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admin access" ON admin_users
  FOR SELECT USING (true);
```

