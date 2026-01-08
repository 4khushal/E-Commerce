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
  try {
    const response = await fetch(`${apiUrl}/api/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items,
        userId,
        shippingAddress,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to create checkout session')
    }

    const session = await response.json()
    return session
  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw error
  }
}

