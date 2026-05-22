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
      console.error('Preferences GET - BACKEND_API_URL is not configured')
      return NextResponse.json({ success: false, error: 'BACKEND_API_URL is not configured' }, { status: 500 })
    }

    const session = await getSession(request)

    if (!session.authenticated || !session.sessionToken) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.sessionToken}`,
    }

    let response = await fetch(`${BACKEND_API_URL}/preferences/current`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    })

    if (response.status === 404) {
      const createResp = await fetch(`${BACKEND_API_URL}/preferences/`, {
        method: 'POST',
        headers,
        body: JSON.stringify({}),
        cache: 'no-store',
      })
      if (!createResp.ok && createResp.status !== 409) {
        const { data } = await fetchJson(createResp, 'Preferences GET auto-create')
        return NextResponse.json(
          { success: false, error: errorMessage(data, 'Failed to create preferences') },
          { status: createResp.status }
        )
      }
      response = await fetch(`${BACKEND_API_URL}/preferences/current`, {
        method: 'GET',
        headers,
        cache: 'no-store',
      })
    }

    const { data, ok } = await fetchJson(response, 'Preferences GET')

    if (!ok) {
      return NextResponse.json(
        { success: false, error: errorMessage(data, 'Failed to fetch preferences') },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Preferences GET API error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const BACKEND_API_URL = process.env.BACKEND_API_URL
    if (!BACKEND_API_URL) {
      console.error('Preferences POST - BACKEND_API_URL is not configured')
      return NextResponse.json({ success: false, error: 'BACKEND_API_URL is not configured' }, { status: 500 })
    }

    const session = await getSession(request)

    if (!session.authenticated || !session.sessionToken) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()

    const response = await fetch(`${BACKEND_API_URL}/preferences/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.sessionToken}`,
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    })

    if (response.status === 409) {
      const getResp = await fetch(`${BACKEND_API_URL}/preferences/current`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.sessionToken}`,
        },
        cache: 'no-store',
      })
      const { data: existing, ok: getOk } = await fetchJson(getResp, 'Preferences POST conflict refetch')
      if (getOk) return NextResponse.json({ success: true, data: existing })
    }

    const { data, ok } = await fetchJson(response, 'Preferences POST')

    if (!ok) {
      return NextResponse.json(
        { success: false, error: errorMessage(data, 'Failed to create preferences') },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    console.error('Preferences POST API error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const BACKEND_API_URL = process.env.BACKEND_API_URL
    if (!BACKEND_API_URL) {
      console.error('Preferences PATCH - BACKEND_API_URL is not configured')
      return NextResponse.json({ success: false, error: 'BACKEND_API_URL is not configured' }, { status: 500 })
    }

    const session = await getSession(request)

    if (!session.authenticated || !session.sessionToken) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()

    const response = await fetch(`${BACKEND_API_URL}/preferences/current`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.sessionToken}`,
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    })

    const { data, ok } = await fetchJson(response, 'Preferences PATCH')

    if (!ok) {
      return NextResponse.json(
        { success: false, error: errorMessage(data, 'Failed to update preferences') },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Preferences PATCH API error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
