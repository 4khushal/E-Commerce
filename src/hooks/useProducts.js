import { useState, useEffect } from 'react'
import { getProducts, searchProducts, getProductsByCategory } from '../services/supabase'

export const useProducts = (searchTerm = '', category = 'all') => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        let data
        
        if (searchTerm) {
          data = await searchProducts(searchTerm)
          // Filter by category if search is active
          if (category && category !== 'all') {
            data = data.filter(product => product.category === category)
          }
        } else {
          data = await getProductsByCategory(category)
        }
        
        setProducts(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [searchTerm, category])

  return { products, loading, error }
}

