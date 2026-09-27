import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase'
import { headers } from 'next/headers'

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return Response.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    return Response.json({ error: `Webhook signature verification failed: ${err}` }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const participantId = session.metadata?.participantId

    if (participantId) {
      const supabase = createServiceClient()
      await supabase
        .from('participants')
        .update({ has_paid: true })
        .eq('id', participantId)
    }
  }

  return Response.json({ received: true })
}
