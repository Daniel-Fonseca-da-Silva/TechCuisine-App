import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/get-session'
import { AUTH_CONFIG } from '@/lib/auth-config'

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
      console.error('Configuration GET - BACKEND_API_URL is not configured')
      return NextResponse.json({ success: false, error: 'BACKEND_API_URL is not configured' }, { status: 500 })
    }

    const session = await getSession(request)

    if (!session.authenticated || !session.sessionToken) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    const response = await fetch(`${BACKEND_API_URL}/configurations/current`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.sessionToken}`
      },
      cache: 'no-store'
    })

    if (response.status === 404) {
      return NextResponse.json({ success: true, data: null }, { status: 200 })
    }

    const { data, ok } = await fetchJson(response, 'Configuration GET')

    if (!ok) {
      return NextResponse.json(
        { success: false, error: errorMessage(data, 'Failed to fetch configuration') },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Configuration GET API error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const BACKEND_API_URL = process.env.BACKEND_API_URL
    if (!BACKEND_API_URL) {
      console.error('Configuration POST - BACKEND_API_URL is not configured')
      return NextResponse.json({ success: false, error: 'BACKEND_API_URL is not configured' }, { status: 500 })
    }

    const session = await getSession(request)

    if (!session.authenticated || !session.sessionToken) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()

    const response = await fetch(`${BACKEND_API_URL}/configurations/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.sessionToken}`
      },
      body: JSON.stringify(body),
      cache: 'no-store'
    })

    if (response.status === 409) {
      // Already exists — fetch current and return it
      const getResp = await fetch(`${BACKEND_API_URL}/configurations/current`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.sessionToken}`
        },
        cache: 'no-store'
      })
      const { data: existing, ok: getOk } = await fetchJson(getResp, 'Configuration POST conflict refetch')
      if (getOk) return NextResponse.json({ success: true, data: existing })
    }

    const { data, ok } = await fetchJson(response, 'Configuration POST')

    if (!ok) {
      return NextResponse.json(
        { success: false, error: errorMessage(data, 'Failed to create configuration') },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    console.error('Configuration POST API error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const BACKEND_API_URL = process.env.BACKEND_API_URL
    if (!BACKEND_API_URL) {
      console.error('Configuration DELETE - BACKEND_API_URL is not configured')
      return NextResponse.json({ success: false, error: 'BACKEND_API_URL is not configured' }, { status: 500 })
    }

    const session = await getSession(request)

    if (!session.authenticated || !session.sessionToken) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    const response = await fetch(`${BACKEND_API_URL}/configurations/current`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${session.sessionToken}`
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      const ct = response.headers.get('content-type') || ''
      let data: unknown = null
      if (ct.includes('application/json')) {
        data = await response.json().catch(() => null)
      }
      return NextResponse.json(
        { success: false, error: errorMessage(data, 'Failed to delete account') },
        { status: response.status }
      )
    }

    const nextResponse = NextResponse.json({ success: true })
    nextResponse.cookies.delete(AUTH_CONFIG.ACCESS_COOKIE_NAME)
    nextResponse.cookies.delete(AUTH_CONFIG.REFRESH_COOKIE_NAME)
    return nextResponse
  } catch (error) {
    console.error('Configuration DELETE API error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const BACKEND_API_URL = process.env.BACKEND_API_URL
    if (!BACKEND_API_URL) {
      console.error('Configuration PATCH - BACKEND_API_URL is not configured')
      return NextResponse.json({ success: false, error: 'BACKEND_API_URL is not configured' }, { status: 500 })
    }

    const session = await getSession(request)

    if (!session.authenticated || !session.sessionToken) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()

    const response = await fetch(`${BACKEND_API_URL}/configurations/current`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.sessionToken}`
      },
      body: JSON.stringify(body),
      cache: 'no-store'
    })

    const { data, ok } = await fetchJson(response, 'Configuration PATCH')

    if (!ok) {
      return NextResponse.json(
        { success: false, error: errorMessage(data, 'Failed to update configuration') },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Configuration PATCH API error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
