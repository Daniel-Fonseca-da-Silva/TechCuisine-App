import { NextRequest, NextResponse } from 'next/server'
import { AUTH_CONFIG } from '@/lib/auth-config'

const BACKEND_API_URL = process.env.BACKEND_API_URL

const allowedPlans = new Set(['simple'])

function isValidUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!BACKEND_API_URL) {
      return NextResponse.json({ success: false, error: 'BACKEND_API_URL is not configured' }, { status: 500 })
    }

    const sessionToken = request.cookies.get(AUTH_CONFIG.SESSION_COOKIE_NAME)?.value
    if (!sessionToken) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json().catch(() => null)
    const plan = body?.plan
    const successUrl = body?.success_url
    const cancelUrl = body?.cancel_url

    if (typeof plan !== 'string' || !allowedPlans.has(plan)) {
      return NextResponse.json(
        { success: false, error: 'Invalid plan. Expected: simple' },
        { status: 400 }
      )
    }

    if (!isValidUrl(successUrl)) {
      return NextResponse.json({ success: false, error: 'Invalid success_url' }, { status: 400 })
    }

    if (!isValidUrl(cancelUrl)) {
      return NextResponse.json({ success: false, error: 'Invalid cancel_url' }, { status: 400 })
    }

    const response = await fetch(`${BACKEND_API_URL}/subscriptions/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({
        plan,
        success_url: successUrl,
        cancel_url: cancelUrl,
      }),
      cache: 'no-store',
    })

    const data = await response.json()

    if (!response.ok) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Checkout failed:', data?.error ?? data)
      }
      return NextResponse.json(
        { success: false, error: 'Unable to start checkout. Please try again later.' },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Subscriptions CHECKOUT POST error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

