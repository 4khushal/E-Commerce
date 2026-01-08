# Separate Admin Dashboard Setup

## Overview

The admin dashboard now uses **completely separate authentication** from regular users:
- ✅ Separate admin login page (`/admin/login`)
- ✅ Separate admin credentials (stored in `admin_users` table)
- ✅ No dependency on user profiles or UID
- ✅ Independent admin session management

## Setup Instructions

### 1. Create Admin Users Table

Run the SQL in `admin-schema.sql` in your Supabase SQL Editor:

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

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Insert your first admin user
-- NOTE: For production, use proper password hashing (bcrypt)
INSERT INTO admin_users (email, password_hash, name, is_active)
VALUES (
  'admin@yourstore.com',
  'your-password-hash-here', -- Use bcrypt in production
  'Admin User',
  true
);
```

### 2. Create Your Admin Account

For now, you can create an admin with a simple approach:

```sql
-- Create admin user (password will be checked in app)
-- For production, hash password with bcrypt
INSERT INTO admin_users (email, password_hash, name, is_active)
VALUES (
  'admin@example.com',
  'admin123', -- Change this! Use proper hashing in production
  'Admin User',
  true
);
```

### 3. Access Admin Dashboard

1. Go to: `http://localhost:3000/admin/login`
2. Enter your admin email and password
3. You'll be redirected to `/admin` dashboard

## Default Admin Credentials (Change These!)

After running the SQL, you can login with:
- **Email**: `admin@example.com`
- **Password**: `admin123` (or whatever you set)

**⚠️ IMPORTANT**: Change these credentials immediately in production!

## Separate Port (Optional)

You can run the admin dashboard on a **separate port**:

### Option 1: Same App, Different Routes (Current Setup)
- User Dashboard: `http://localhost:3000`
- Admin Login: `http://localhost:3000/admin/login`
- Admin Dashboard: `http://localhost:3000/admin`

### Option 2: Separate Port (Recommended for Production)

1. **Run Admin Dashboard on Port 3001:**
   ```bash
   npm run dev:admin
   ```
   - Admin will be at: `http://localhost:3001`

2. **Run User Dashboard on Port 3000:**
   ```bash
   npm run dev
   ```
   - User app will be at: `http://localhost:3000`

This way, you have completely separate instances running!

## Security Notes

⚠️ **Current Implementation**: Uses simple password check for demo
✅ **Production**: Must implement proper bcrypt password hashing

For production, update `src/context/AdminAuthContext.jsx` to:
- Hash passwords with bcrypt when creating admin users
- Verify passwords using `bcrypt.compare()` on login

## Admin Routes

- `/admin/login` - Admin login page
- `/admin` - Admin dashboard (protected)
- `/admin/products` - Product management
- `/admin/orders` - Order management
- `/admin/categories` - Category management

## Features

✅ Completely separate from user authentication
✅ No UID or profile role checks
✅ Independent session management
✅ Clean admin-only login flow
✅ Can run on separate port if needed

