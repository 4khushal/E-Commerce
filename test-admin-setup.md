# Admin Dashboard Troubleshooting Guide

## Common Issues and Solutions

### Issue 1: "Invalid admin credentials" error
**Solution**: Make sure you've created the admin_users table and inserted an admin user:

```sql
-- Run this in Supabase SQL Editor
-- 1. Create the table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Insert admin user
INSERT INTO admin_users (email, password_hash, name, is_active)
VALUES ('admin@example.com', 'admin123', 'Admin User', true)
ON CONFLICT (email) DO NOTHING;
```

### Issue 2: Table doesn't exist error
**Solution**: Run the complete `admin-schema.sql` file in Supabase SQL Editor

### Issue 3: Can't access admin dashboard after login
**Solution**: 
- Check browser console (F12) for errors
- Verify sessionStorage has 'admin_session' key
- Make sure you're accessing `/admin` not just `/`

### Issue 4: Blank page on port 3001
**Solution**:
- Wait 10-15 seconds for server to fully start
- Hard refresh: Ctrl+Shift+R
- Check terminal for compilation errors
- Try accessing `http://localhost:3001/admin/login` directly

### Issue 5: RLS (Row Level Security) blocking access
**Solution**: Temporarily disable RLS or add policy:

```sql
-- Temporarily allow all (for setup)
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- Or create a policy
CREATE POLICY "Allow admin access" ON admin_users
  FOR SELECT USING (true);
```

## Testing Steps

1. **Verify table exists:**
   ```sql
   SELECT * FROM admin_users;
   ```

2. **Verify admin user exists:**
   ```sql
   SELECT email, name, is_active FROM admin_users WHERE email = 'admin@example.com';
   ```

3. **Test login:**
   - Go to: `http://localhost:3001/admin/login`
   - Email: `admin@example.com`
   - Password: `admin123`

4. **Check browser console:**
   - Open DevTools (F12)
   - Look for errors in Console tab
   - Check Network tab for failed requests

5. **Check sessionStorage:**
   - After login, check: `sessionStorage.getItem('admin_session')`
   - Should contain JSON with admin data

