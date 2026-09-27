import Stripe from 'stripe'

// Server-side only — never import in client components
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
