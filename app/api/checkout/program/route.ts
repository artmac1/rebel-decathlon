import { stripe } from '@/lib/stripe'

export async function POST(request: Request) {
  const { attemptId, participantId, weakEvents } = await request.json()

  if (!attemptId || !participantId) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const origin = new URL(request.url).origin

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: 4700, // $47.00
            product_data: {
              name: 'Rebel Decathlon — 6-Week Custom Program',
              description: 'A structured 6-week training plan built around your 3 weakest areas.',
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        product: 'custom_program',
        attemptId,
        participantId,
        // Comma-separated event keys for the 3 weak areas (for fulfillment reference)
        weakEvents: weakEvents ?? '',
      },
      success_url: `${origin}/program/success`,
      cancel_url: `${origin}/results/${attemptId}`,
    })

    return Response.json({ url: session.url })
  } catch (err) {
    console.error('[checkout/program] Stripe session creation failed:', err)
    return Response.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
