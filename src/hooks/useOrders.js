import { useState, useEffect } from 'react'
import { getUserOrders } from '../services/supabase'
import { useAuth } from '../context/AuthContext'

export const useOrders = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchOrders = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getUserOrders(user.id)
        setOrders(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [user])

  return { orders, loading, error }
}

