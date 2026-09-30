import { createServiceClient } from '@/lib/supabase'
import { stripe } from '@/lib/stripe'

export async function POST(request: Request) {
  const { participantId } = await request.json()

  if (!participantId) {
    return Response.json({ error: 'Missing participantId' }, { status: 400 })
  }

  const supabase = createServiceClient()

  const { data: participant, error } = await supabase
    .from('participants')
    .select('id, email, first_name')
    .eq('id', participantId)
    .single()

  if (error || !participant) {
    return Response.json({ error: 'Participant not found' }, { status: 404 })
  }

  const origin = new URL(request.url).origin

  let session: Awaited<ReturnType<typeof stripe.checkout.sessions.create>>
  try {
    session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price: process.env.STRIPE_PRO_PRICE_ID,
          quantity: 1,
        },
      ],
      customer_email: participant.email,
      metadata: { participantId: participant.id },
      success_url: `${origin}/upgrade/success`,
      cancel_url: `${origin}/upgrade?pid=${participant.id}&cancelled=1`,
    })
  } catch (err) {
    console.error('Stripe checkout session error:', err)
    return Response.json({ error: 'Payment setup failed. Please try again.' }, { status: 500 })
  }

  return Response.json({ url: session.url })
}
