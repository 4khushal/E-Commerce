import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabase'

export const useAdmin = () => {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false)
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (error) {
          // If profile doesn't exist, create one with default 'user' role
          if (error.code === 'PGRST116') {
            try {
              const { error: insertError } = await supabase
                .from('profiles')
                .insert({ id: user.id, role: 'user' })
              
              if (insertError) {
                console.error('Error creating profile:', insertError)
              }
              // New profile created with 'user' role - not admin
              setIsAdmin(false)
            } catch (insertErr) {
              console.error('Error creating profile:', insertErr)
              setIsAdmin(false)
            }
          } else {
            console.error('Error checking admin status:', error)
            setIsAdmin(false)
          }
        } else {
          // Check if role is explicitly 'admin'
          const userRole = data?.role || 'user'
          setIsAdmin(userRole === 'admin')
        }
      } catch (error) {
        console.error('Error checking admin status:', error)
        // On any error, assume not admin for security
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }

    checkAdminStatus()
  }, [user])

  return { isAdmin, loading }
}

