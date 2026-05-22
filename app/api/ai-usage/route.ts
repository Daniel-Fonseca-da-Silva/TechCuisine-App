import { NextRequest, NextResponse } from 'next/server'
import { AUTH_CONFIG } from '@/lib/auth-config'

const BACKEND_API_URL = process.env.BACKEND_API_URL

export async function GET(request: NextRequest) {
  try {
    if (!BACKEND_API_URL) {
      return NextResponse.json({ error: 'BACKEND_API_URL is not configured' }, { status: 500 })
    }

    const sessionToken = request.cookies.get(AUTH_CONFIG.SESSION_COOKIE_NAME)?.value
    if (!sessionToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const response = await fetch(`${BACKEND_API_URL}/ai-usage`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`,
      },
      cache: 'no-store',
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error || data?.message || 'Failed to fetch AI usage' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('AI usage GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
