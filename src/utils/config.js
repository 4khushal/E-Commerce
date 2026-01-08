export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
export const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
export const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002'
export const frontendUrl = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:3000'

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials are missing. Please check your .env file.')
}

if (!stripePublishableKey) {
  console.warn('Stripe publishable key is missing. Please check your .env file.')
}

