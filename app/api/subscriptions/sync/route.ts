import { NextRequest, NextResponse } from 'next/server'
import { AUTH_CONFIG } from '@/lib/auth-config'

const BACKEND_API_URL = process.env.BACKEND_API_URL

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
    const sessionId = body?.session_id

    if (typeof sessionId !== 'string' || !sessionId.startsWith('cs_')) {
      return NextResponse.json({ success: false, error: 'Invalid session_id' }, { status: 400 })
    }

    const response = await fetch(`${BACKEND_API_URL}/subscriptions/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({ session_id: sessionId }),
      cache: 'no-store',
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      // Pass through the status code so the frontend can handle 409 (sync pending) vs other errors.
      return NextResponse.json(
        { success: false, error: data?.error ?? 'Sync failed' },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Subscriptions SYNC POST error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
