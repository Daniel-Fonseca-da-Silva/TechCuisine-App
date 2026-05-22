import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/get-session'

export async function GET(request: NextRequest) {
  try {
    const BACKEND_API_URL = process.env.BACKEND_API_URL
    if (!BACKEND_API_URL) {
      return NextResponse.json({ success: false, error: 'BACKEND_API_URL is not configured' }, { status: 500 })
    }

    const session = await getSession(request)
    if (!session.authenticated || !session.sessionToken) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    const response = await fetch(`${BACKEND_API_URL}/reports/tenant-summary`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.sessionToken}`,
      },
      cache: 'no-store',
    })

    const ct = response.headers.get('content-type') || ''
    if (!ct.includes('application/json')) {
      return NextResponse.json({ success: false, error: 'Unexpected backend response' }, { status: 502 })
    }

    const data = await response.json()
    if (!response.ok) {
      const detail = typeof data?.detail === 'string' ? data.detail : (data?.error ?? 'Failed to fetch report')
      return NextResponse.json({ success: false, error: detail }, { status: response.status })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Reports tenant-summary GET error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
