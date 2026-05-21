import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/get-session'

function extractDetail(data: unknown): string | undefined {
  if (!data || typeof data !== 'object') return undefined
  const d = data as Record<string, unknown>
  if (typeof d.detail === 'string') return d.detail
  if (Array.isArray(d.detail) && d.detail.length > 0) {
    const first = d.detail[0]
    if (first && typeof first === 'object' && 'msg' in first) return String((first as Record<string, unknown>).msg)
    return String(first)
  }
  return undefined
}

function errorMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== 'object') return fallback
  const d = data as Record<string, unknown>
  return extractDetail(d) ?? String(d.message ?? d.error ?? fallback)
}

async function fetchJson(response: Response, label: string): Promise<{ data: unknown; ok: boolean }> {
  const ct = response.headers.get('content-type') || ''
  if (!ct.includes('application/json')) {
    const snippet = await response.text().catch(() => '')
    console.error(`${label} - backend response is not JSON. Snippet:`, snippet.slice(0, 300))
    return { data: null, ok: false }
  }
  const data = await response.json()
  return { data, ok: response.ok }
}

export async function GET(request: NextRequest) {
  try {
    const BACKEND_API_URL = process.env.BACKEND_API_URL
    if (!BACKEND_API_URL) {
      console.error('SalesRecords GET - BACKEND_API_URL is not configured')
      return NextResponse.json({ success: false, error: 'BACKEND_API_URL is not configured' }, { status: 500 })
    }

    const session = await getSession(request)
    if (!session.authenticated || !session.sessionToken) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const cursor = searchParams.get('cursor')
    const limit = searchParams.get('limit')

    const backendParams = new URLSearchParams()
    if (cursor) backendParams.set('cursor', cursor)
    if (limit) backendParams.set('limit', limit)

    const qs = backendParams.toString()
    const url = `${BACKEND_API_URL}/sales-records/${qs ? `?${qs}` : ''}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.sessionToken}`,
      },
      cache: 'no-store',
    })

    const { data, ok } = await fetchJson(response, 'SalesRecords GET')

    if (!ok) {
      return NextResponse.json(
        { success: false, error: errorMessage(data, 'Failed to fetch sales records') },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('SalesRecords GET API error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const BACKEND_API_URL = process.env.BACKEND_API_URL
    if (!BACKEND_API_URL) {
      console.error('SalesRecords POST - BACKEND_API_URL is not configured')
      return NextResponse.json({ success: false, error: 'BACKEND_API_URL is not configured' }, { status: 500 })
    }

    const session = await getSession(request)
    if (!session.authenticated || !session.sessionToken) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()

    const response = await fetch(`${BACKEND_API_URL}/sales-records/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.sessionToken}`,
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    })

    const { data, ok } = await fetchJson(response, 'SalesRecords POST')

    if (!ok) {
      return NextResponse.json(
        { success: false, error: errorMessage(data, 'Failed to create sales record') },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    console.error('SalesRecords POST API error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
