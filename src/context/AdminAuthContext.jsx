import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../services/supabase'

const AdminAuthContext = createContext({})

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if admin is logged in from sessionStorage
    const adminSession = sessionStorage.getItem('admin_session')
    if (adminSession) {
      try {
        const adminData = JSON.parse(adminSession)
        setAdmin(adminData)
      } catch (error) {
        console.error('Error parsing admin session:', error)
        sessionStorage.removeItem('admin_session')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      // Check admin credentials in admin_users table
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, email, name, password_hash, is_active')
        .eq('email', email)
        .eq('is_active', true)
        .single()

      // Handle different error cases
      if (error) {
        console.error('Supabase error:', error)
        
        // Check if table doesn't exist
        if (error.code === 'PGRST205' || error.message?.includes('does not exist')) {
          throw new Error('Admin users table not found. Please run admin-schema.sql in Supabase.')
        }
        
        // Check if no rows found
        if (error.code === 'PGRST116') {
          throw new Error('No admin user found with this email. Please create an admin account first.')
        }
        
        // RLS policy blocking
        if (error.code === '42501' || error.message?.includes('permission denied')) {
          throw new Error('Access denied. Please check RLS policies on admin_users table.')
        }
        
        throw new Error(error.message || 'Failed to authenticate. Please check your credentials.')
      }

      if (!data) {
        throw new Error('Invalid admin credentials')
      }

      // Password verification
      // For production: Use bcrypt.compare(password, data.password_hash)
      // For demo: Simple string comparison (NOT SECURE - for production use bcrypt)
      
      if (!password || password.length < 3) {
        throw new Error('Password too short')
      }
      
      if (data.password_hash !== password) {
        throw new Error('Invalid password')
      }
      
      const adminData = {
        id: data.id,
        email: data.email,
        name: data.name,
      }

      // Store in sessionStorage
      sessionStorage.setItem('admin_session', JSON.stringify(adminData))
      setAdmin(adminData)

      return { success: true, admin: adminData }
    } catch (error) {
      console.error('Admin login error:', error)
      throw new Error(error.message || 'Invalid admin credentials')
    }
  }

  const logout = () => {
    sessionStorage.removeItem('admin_session')
    setAdmin(null)
  }

  const value = {
    admin,
    loading,
    login,
    logout,
  }

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

