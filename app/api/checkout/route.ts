import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getSession } from '@/lib/get-session'

export async function POST(request: NextRequest) {
  const sessionResult = await getSession(request)

  if (!sessionResult.authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '')

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: sessionResult.user.email,
      return_url: `${request.headers.get('origin')}/dashboard?premium_activated=true`,
    })

    return NextResponse.json({
      id: checkoutSession.id,
      client_secret: checkoutSession.client_secret,
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
