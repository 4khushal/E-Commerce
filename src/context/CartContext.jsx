import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { useAuth } from './AuthContext'
import {
  getCartItems,
  addCartItem,
  updateCartItemQuantity,
  removeCartItem,
  clearCart as clearCartSupabase,
} from '../services/supabase'

const CartContext = createContext({})

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const isInitialLoad = useRef(true)
  const isSyncing = useRef(false)
  const useSupabaseCart = useRef(true) // Track if Supabase cart table exists

  // Check if error is due to missing cart table
  const isCartTableMissing = (error) => {
    return error?.code === 'PGRST205' || 
           error?.message?.includes("Could not find the table 'public.cart'")
  }

  // Load cart from Supabase (if logged in) or localStorage (if anonymous)
  useEffect(() => {
    const loadCart = async () => {
      try {
        setLoading(true)
        
        if (user && useSupabaseCart.current) {
          try {
            // User is logged in - try to load from Supabase
            const supabaseCart = await getCartItems(user.id)
            setCartItems(supabaseCart)
            
            // Merge localStorage cart with Supabase cart on first login
            if (isInitialLoad.current) {
              const localCart = localStorage.getItem('cart')
              if (localCart) {
                try {
                  const localCartItems = JSON.parse(localCart)
                  if (localCartItems.length > 0) {
                    // Merge local cart items into Supabase
                    for (const item of localCartItems) {
                      await addCartItem(user.id, item.id, item.quantity)
                    }
                    // Reload cart after merge
                    const mergedCart = await getCartItems(user.id)
                    setCartItems(mergedCart)
                    // Clear localStorage after merge
                    localStorage.removeItem('cart')
                  }
                } catch (error) {
                  // If merge fails, keep using localStorage
                  if (!isCartTableMissing(error)) {
                    console.error('Error merging local cart:', error)
                  }
                }
              }
              isInitialLoad.current = false
            }
          } catch (error) {
            // If cart table doesn't exist, fall back to localStorage
            if (isCartTableMissing(error)) {
              useSupabaseCart.current = false
              // Load from localStorage instead
              const savedCart = localStorage.getItem('cart')
              if (savedCart) {
                try {
                  setCartItems(JSON.parse(savedCart))
                } catch (parseError) {
                  console.error('Error loading cart from localStorage:', parseError)
                }
              }
            } else {
              // Other error - still try localStorage as fallback
              const savedCart = localStorage.getItem('cart')
              if (savedCart) {
                try {
                  setCartItems(JSON.parse(savedCart))
                } catch (parseError) {
                  console.error('Error loading cart from localStorage:', parseError)
                }
              }
            }
            isInitialLoad.current = false
          }
        } else {
          // User is not logged in or Supabase cart unavailable - load from localStorage
          const savedCart = localStorage.getItem('cart')
          if (savedCart) {
            try {
              setCartItems(JSON.parse(savedCart))
            } catch (error) {
              console.error('Error loading cart from localStorage:', error)
            }
          }
          isInitialLoad.current = false
        }
      } catch (error) {
        // Final fallback - try localStorage
        if (!isCartTableMissing(error)) {
          console.error('Error loading cart:', error)
        }
        const savedCart = localStorage.getItem('cart')
        if (savedCart) {
          try {
            setCartItems(JSON.parse(savedCart))
          } catch (parseError) {
            // Silent fail
          }
        }
      } finally {
        setLoading(false)
      }
    }

    loadCart()
  }, [user])

  // Save cart to localStorage for anonymous users or when Supabase cart is unavailable
  useEffect(() => {
    if ((!user || !useSupabaseCart.current) && !loading) {
      localStorage.setItem('cart', JSON.stringify(cartItems))
    }
  }, [cartItems, user, loading])

  const addToCart = async (product, quantity = 1) => {
    if (isSyncing.current) return
    
    try {
      isSyncing.current = true
      
      if (user && useSupabaseCart.current) {
        try {
          // Sync with Supabase
          await addCartItem(user.id, product.id, quantity)
          // Reload cart from Supabase
          const updatedCart = await getCartItems(user.id)
          setCartItems(updatedCart)
          return
        } catch (error) {
          // If cart table is missing, disable Supabase cart and use localStorage
          if (isCartTableMissing(error)) {
            useSupabaseCart.current = false
          } else {
            throw error
          }
        }
      }
      
      // Fallback to local state update (for anonymous users or when Supabase unavailable)
      setCartItems((prevItems) => {
        const existingItem = prevItems.find((item) => item.id === product.id)
        
        if (existingItem) {
          return prevItems.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        }
        
        return [...prevItems, { ...product, quantity }]
      })
    } catch (error) {
      // Fallback to local state update on error
      setCartItems((prevItems) => {
        const existingItem = prevItems.find((item) => item.id === product.id)
        
        if (existingItem) {
          return prevItems.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        }
        
        return [...prevItems, { ...product, quantity }]
      })
    } finally {
      isSyncing.current = false
    }
  }

  const removeFromCart = async (productId) => {
    if (isSyncing.current) return
    
    try {
      isSyncing.current = true
      
      if (user && useSupabaseCart.current) {
        try {
          // Sync with Supabase
          await removeCartItem(user.id, productId)
          // Reload cart from Supabase
          const updatedCart = await getCartItems(user.id)
          setCartItems(updatedCart)
          return
        } catch (error) {
          // If cart table is missing, disable Supabase cart and use localStorage
          if (isCartTableMissing(error)) {
            useSupabaseCart.current = false
          }
        }
      }
      
      // Fallback to local state update
      setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId))
    } catch (error) {
      // Fallback to local state update on error
      setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId))
    } finally {
      isSyncing.current = false
    }
  }

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      await removeFromCart(productId)
      return
    }
    
    if (isSyncing.current) return
    
    try {
      isSyncing.current = true
      
      if (user && useSupabaseCart.current) {
        try {
          // Sync with Supabase
          await updateCartItemQuantity(user.id, productId, quantity)
          // Reload cart from Supabase
          const updatedCart = await getCartItems(user.id)
          setCartItems(updatedCart)
          return
        } catch (error) {
          // If cart table is missing, disable Supabase cart and use localStorage
          if (isCartTableMissing(error)) {
            useSupabaseCart.current = false
          }
        }
      }
      
      // Fallback to local state update
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        )
      )
    } catch (error) {
      // Fallback to local state update on error
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        )
      )
    } finally {
      isSyncing.current = false
    }
  }

  const clearCart = async () => {
    if (isSyncing.current) return
    
    try {
      isSyncing.current = true
      
      if (user && useSupabaseCart.current) {
        try {
          // Clear Supabase cart
          await clearCartSupabase(user.id)
        } catch (error) {
          // If cart table is missing, disable Supabase cart
          if (isCartTableMissing(error)) {
            useSupabaseCart.current = false
          }
        }
      }
      
      // Clear local state
      setCartItems([])
      
      // Clear localStorage
      localStorage.removeItem('cart')
    } catch (error) {
      // Fallback to local state clear on error
      setCartItems([])
      localStorage.removeItem('cart')
    } finally {
      isSyncing.current = false
    }
  }

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = typeof item.price === 'number' ? item.price : parseFloat(item.price)
      return total + price * item.quantity
    }, 0)
  }

  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  const value = {
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

