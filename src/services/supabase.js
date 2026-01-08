import { createClient } from '@supabase/supabase-js'
import { supabaseUrl, supabaseAnonKey } from '../utils/config'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Products
export const getProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export const getProductById = async (id) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

// Get multiple products by their IDs (for order items)
export const getProductsByIds = async (productIds) => {
  if (!productIds || productIds.length === 0) {
    return []
  }
  
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, image, price, sku, category')
      .in('id', productIds)
    
    if (error) {
      console.error('Error fetching products by IDs:', error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('Error in getProductsByIds:', error)
    return []
  }
}

export const searchProducts = async (searchTerm) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
  
  if (error) throw error
  return data
}

export const getProductsByCategory = async (category) => {
  let query = supabase
    .from('products')
    .select('*')
  
  if (category && category !== 'all') {
    query = query.eq('category', category)
  }
  
  const { data, error } = await query.order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

// Orders
export const createOrder = async (orderData) => {
  const { data, error } = await supabase
    .from('orders')
    .insert([orderData])
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Check if order already exists for a given Stripe session ID
export const checkOrderExists = async (stripeSessionId) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('id')
      .eq('stripe_payment_intent_id', stripeSessionId)
      .limit(1)
    
    if (error) {
      // If table doesn't exist or RLS blocks, return false (allow creation)
      if (error.code === 'PGRST205' || error.code === '42501') {
        return false
      }
      throw error
    }
    
    return data && data.length > 0
  } catch (error) {
    console.error('Error checking for existing order:', error)
    // On error, return false to allow order creation (fail open)
    return false
  }
}

export const getUserOrders = async (userId) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export const getOrderById = async (orderId, userId) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .eq('user_id', userId)
    .single()
  
  if (error) throw error
  return data
}

// Cart operations
export const getCartItems = async (userId) => {
  const { data, error } = await supabase
    .from('cart')
    .select(`
      *,
      products (
        id,
        name,
        description,
        price,
        image,
        stock,
        category,
        sku
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
  
  if (error) throw error
  
  // Transform cart items to match the expected format
  return data.map(item => ({
    id: item.product_id,
    quantity: item.quantity,
    ...item.products,
  }))
}

export const addCartItem = async (userId, productId, quantity = 1) => {
  // Check if item already exists in cart
  const { data: existingItem } = await supabase
    .from('cart')
    .select('*')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .single()
  
  if (existingItem) {
    // Update quantity if item exists
    const { data, error } = await supabase
      .from('cart')
      .update({ quantity: existingItem.quantity + quantity })
      .eq('user_id', userId)
      .eq('product_id', productId)
      .select(`
        *,
        products (
          id,
          name,
          description,
          price,
          image,
          stock,
          category,
          sku
        )
      `)
      .single()
    
    if (error) throw error
    
    return {
      id: data.product_id,
      quantity: data.quantity,
      ...data.products,
    }
  } else {
    // Insert new item
    const { data, error } = await supabase
      .from('cart')
      .insert({
        user_id: userId,
        product_id: productId,
        quantity,
      })
      .select(`
        *,
        products (
          id,
          name,
          description,
          price,
          image,
          stock,
          category,
          sku
        )
      `)
      .single()
    
    if (error) throw error
    
    return {
      id: data.product_id,
      quantity: data.quantity,
      ...data.products,
    }
  }
}

export const updateCartItemQuantity = async (userId, productId, quantity) => {
  if (quantity <= 0) {
    return removeCartItem(userId, productId)
  }
  
  const { data, error } = await supabase
    .from('cart')
    .update({ quantity })
    .eq('user_id', userId)
    .eq('product_id', productId)
    .select(`
      *,
      products (
        id,
        name,
        description,
        price,
        image,
        stock,
        category,
        sku
      )
    `)
    .single()
  
  if (error) throw error
  
  return {
    id: data.product_id,
    quantity: data.quantity,
    ...data.products,
  }
}

export const removeCartItem = async (userId, productId) => {
  const { error } = await supabase
    .from('cart')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId)
  
  if (error) throw error
}

export const clearCart = async (userId) => {
  const { error } = await supabase
    .from('cart')
    .delete()
    .eq('user_id', userId)
  
  if (error) throw error
}

// Admin authentication - verify admin credentials
export const verifyAdminCredentials = async (email, password) => {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('id, email, name, password_hash, is_active')
      .eq('email', email)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      return { valid: false, error: 'Invalid credentials' }
    }

    // For production: verify password hash using bcrypt
    // For now: simple check (NOT SECURE - implement proper hashing)
    // TODO: Implement bcrypt password verification
    // const isValid = await bcrypt.compare(password, data.password_hash)
    
    // Temporary: accept if email exists (CHANGE IN PRODUCTION!)
    return { valid: true, admin: { id: data.id, email: data.email, name: data.name } }
  } catch (error) {
    console.error('Admin verification error:', error)
    return { valid: false, error: error.message }
  }
}

// Admin operations - Products
export const createProduct = async (productData) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating product:', error)
      throw new Error(error.message || 'Failed to create product. Check if you have admin permissions.')
    }
    return data
  } catch (error) {
    console.error('Create product error:', error)
    throw error
  }
}

export const updateProduct = async (productId, productData) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', productId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating product:', error)
      throw new Error(error.message || 'Failed to update product. Check if you have admin permissions.')
    }
    return data
  } catch (error) {
    console.error('Update product error:', error)
    throw error
  }
}

export const deleteProduct = async (productId) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)
  
  if (error) throw error
}

// Admin operations - Orders
export const getAllOrders = async () => {
  try {
    // Use service role key for admin operations if available
    // Otherwise, use anon key (requires RLS policy to allow)
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching orders:', error)
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      
      // Check if table doesn't exist
      if (error.code === 'PGRST205' || error.message?.includes('does not exist')) {
        console.warn('Orders table not found. Returning empty array.')
        return []
      }
      
      // Check if RLS is blocking
      if (error.code === '42501' || error.message?.includes('permission denied') || error.message?.includes('new row violates row-level security')) {
        console.error('RLS policy blocking orders access.')
        console.error('SOLUTION: Run fix-admin-orders-access.sql in Supabase SQL Editor')
        throw new Error('Access denied by RLS policy. Run fix-admin-orders-access.sql to fix this.')
      }
      
      throw error
    }
    
    // If no orders, return empty array
    if (!data || data.length === 0) {
      console.log('No orders found in database')
      return []
    }
    
    // Get user emails separately if needed
    const ordersWithUserInfo = await Promise.all(
      data.map(async (order) => {
        try {
          // Get profile info if available
          if (order.user_id) {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('first_name, last_name, phone')
              .eq('id', order.user_id)
              .single()
            
            // If profile fetch succeeds, use it
            if (!profileError && profile) {
              return {
                ...order,
                customer_name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown Customer',
                customer_phone: profile.phone || order.shipping_address?.phone || order.shipping_address?.p || 'N/A',
              }
            }
            
            // If profile fetch fails (RLS blocking), silently fall through to shipping address
            if (profileError) {
              console.warn(`Profile fetch failed for user ${order.user_id}:`, profileError.message)
            }
          }
          
          // Fallback to shipping address info (always works)
          // Handle both full format (firstName, lastName) and compact format (fn, ln)
          const firstName = order.shipping_address?.firstName || order.shipping_address?.fn || ''
          const lastName = order.shipping_address?.lastName || order.shipping_address?.ln || ''
          const email = order.shipping_address?.email || order.shipping_address?.e || ''
          const phone = order.shipping_address?.phone || order.shipping_address?.p || 'N/A'
          
          return {
            ...order,
            customer_name: firstName && lastName
              ? `${firstName} ${lastName}`
              : order.shipping_address?.name || 
                (email ? email.split('@')[0] : 'Unknown Customer'),
            customer_phone: phone,
          }
        } catch (err) {
          // If anything fails, use shipping address info
          console.warn('Error processing order:', order.id, err)
          // Handle both full format (firstName, lastName) and compact format (fn, ln)
          const firstName = order.shipping_address?.firstName || order.shipping_address?.fn || ''
          const lastName = order.shipping_address?.lastName || order.shipping_address?.ln || ''
          const email = order.shipping_address?.email || order.shipping_address?.e || ''
          const phone = order.shipping_address?.phone || order.shipping_address?.p || 'N/A'
          
          return {
            ...order,
            customer_name: firstName && lastName
              ? `${firstName} ${lastName}`
              : order.shipping_address?.name || 
                (email ? email.split('@')[0] : 'Unknown Customer'),
            customer_phone: phone,
          }
        }
      })
    )
    
    return ordersWithUserInfo
  } catch (error) {
    console.error('Error in getAllOrders:', error)
    throw error
  }
}

export const updateOrderStatus = async (orderId, status) => {
  try {
    // First, try to update
    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating order status:', error)
      
      // Check if RLS is blocking
      if (error.code === '42501' || error.message?.includes('permission denied') || error.message?.includes('new row violates row-level security')) {
        throw new Error('Access denied. Check RLS UPDATE policies for orders table. Run fix-admin-orders-access.sql')
      }
      
      // If single() fails but update might have succeeded, try without single()
      if (error.code === 'PGRST116') {
        console.warn('Select after update failed, but update may have succeeded. Verifying...')
        // Try to get the order without single() to verify update worked
        const { data: verifyData, error: verifyError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .limit(1)
        
        if (verifyError) {
          throw new Error(`Update may have failed: ${verifyError.message}`)
        }
        
        if (verifyData && verifyData.length > 0 && verifyData[0].status === status) {
          // Update succeeded, return the data
          return verifyData[0]
        } else {
          throw new Error('Update failed or status mismatch')
        }
      }
      
      throw error
    }
    
    return data
  } catch (error) {
    console.error('Error in updateOrderStatus:', error)
    throw error
  }
}

// Image upload to Supabase Storage
export const uploadProductImage = async (file, productId) => {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${productId}-${Date.now()}.${fileExt}`
    const filePath = `products/${fileName}`

    // Check if bucket exists, if not, use a fallback
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      // If bucket doesn't exist or upload fails, return a data URL as fallback
      console.warn('Supabase Storage upload failed:', uploadError)
      console.warn('Using data URL as fallback. Please set up Supabase Storage bucket "product-images"')
      
      // Convert file to data URL as fallback
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          resolve(reader.result)
        }
        reader.readAsDataURL(file)
      })
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath)

    return publicUrl
  } catch (error) {
    console.error('Image upload error:', error)
    // Fallback to data URL
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        resolve(reader.result)
      }
      reader.readAsDataURL(file)
    })
  }
}

// Delete image from Supabase Storage
export const deleteProductImage = async (imageUrl) => {
  // Extract file path from URL
  const urlParts = imageUrl.split('/')
  const filePath = urlParts.slice(urlParts.indexOf('product-images')).join('/')
  
  const { error } = await supabase.storage
    .from('product-images')
    .remove([filePath])
  
  if (error) throw error
}

