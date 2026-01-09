import { loadStripe } from '@stripe/stripe-js'
import { stripePublishableKey, apiUrl } from '../utils/config'

export const stripePromise = loadStripe(stripePublishableKey)

/**
 * Create a Stripe checkout session
 * @param {Array} items - Array of cart items
 * @param {string} userId - User ID
 * @returns {Promise} Stripe checkout session
 */
export const createCheckoutSession = async (items, userId, shippingAddress = null) => {
  console.log('🛒 Creating checkout session...')
  console.log('🔍 API URL:', apiUrl)
  console.log('🔍 Items count:', items?.length)
  console.log('🔍 User ID:', userId)
  
  // Validate inputs
  if (!items || items.length === 0) {
    throw new Error('Cart is empty. Please add items to your cart.')
  }
  
  if (!userId) {
    throw new Error('User not authenticated. Please login to continue.')
  }
  
  if (!apiUrl || apiUrl.includes('localhost')) {
    console.error('⚠️ API URL is not configured:', apiUrl)
    throw new Error('Payment service is not configured. Please contact support.')
  }

  let lastError
  let lastResponse
  
  // Retry logic for mobile network issues
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt + 1}/3 to create checkout session...`)
      
      // Create AbortController for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 20000) // 20 second timeout
      
      const response = await fetch(`${apiUrl}/api/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          items,
          userId,
          shippingAddress,
        }),
        signal: controller.signal,
        mode: 'cors',
      })
      
      clearTimeout(timeoutId)
      lastResponse = response
      
      console.log(`📡 Response status: ${response.status} ${response.statusText}`)
      
      if (response.ok) {
        const session = await response.json()
        console.log('✅ Checkout session created:', session.sessionId)
        return session
      } else {
        // Try to get error message from response
        let errorMessage = `Failed to create checkout session (Status: ${response.status})`
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
          console.error('❌ Error response:', errorData)
        } catch (e) {
          const text = await response.text()
          console.error('❌ Error response text:', text)
          if (text) {
            try {
              const parsed = JSON.parse(text)
              errorMessage = parsed.error || errorMessage
            } catch (parseError) {
              // Use text as error message if it's not JSON
              if (text.length < 200) {
                errorMessage = text
              }
            }
          }
        }
        lastError = new Error(errorMessage)
      }
    } catch (fetchError) {
      console.error(`❌ Fetch error on attempt ${attempt + 1}:`, fetchError)
      lastError = fetchError
      
      // Provide better error messages
      if (fetchError.name === 'AbortError') {
        lastError = new Error('Request timed out. Please check your internet connection and try again.')
      } else if (fetchError.message && (fetchError.message.includes('Failed to fetch') || fetchError.message.includes('NetworkError'))) {
        lastError = new Error('Network error. Please check your internet connection and try again.')
      } else if (fetchError.message && fetchError.message.includes('CORS')) {
        lastError = new Error('Connection error. Please contact support.')
      } else if (fetchError.message) {
        lastError = new Error(fetchError.message)
      } else {
        lastError = new Error('Failed to create checkout session. Please try again.')
      }
      
      // Wait before retry (exponential backoff)
      if (attempt < 2) {
        const waitTime = 1000 * (attempt + 1)
        console.log(`⏳ Waiting ${waitTime}ms before retry...`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }
  }
  
  // All retries failed
  console.error('❌ Failed to create checkout session after 3 attempts')
  console.error('❌ Last error:', lastError)
  console.error('❌ Last response status:', lastResponse?.status)
  
  throw lastError || new Error('Failed to create checkout session. Please check your internet connection and try again.')
}

