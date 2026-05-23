import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/get-session'

const BACKEND_API_URL = process.env.BACKEND_API_URL

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

    const session = await getSession(request)
    if (!session.authenticated || !session.sessionToken) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json().catch(() => null)
    const returnUrl = body?.return_url

    if (!isValidUrl(returnUrl)) {
      return NextResponse.json({ success: false, error: 'Invalid return_url' }, { status: 400 })
    }

    const response = await fetch(`${BACKEND_API_URL}/subscriptions/portal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.sessionToken}`,
      },
      body: JSON.stringify({ return_url: returnUrl }),
      cache: 'no-store',
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Portal failed:', data?.error ?? data)
      }
      return NextResponse.json(
        { success: false, error: 'Unable to open billing portal. Please try again later.' },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Subscriptions PORTAL POST error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
