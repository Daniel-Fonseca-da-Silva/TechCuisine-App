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
      console.error('Ingredients by-name GET - BACKEND_API_URL is not configured')
      return NextResponse.json({ success: false, error: 'BACKEND_API_URL is not configured' }, { status: 500 })
    }

    const session = await getSession(request)

    if (!session.authenticated || !session.sessionToken) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const name = searchParams.get('name')

    if (!name) {
      return NextResponse.json({ success: false, error: 'name query param is required' }, { status: 400 })
    }

    const url = `${BACKEND_API_URL}/ingredients/by-name?name=${encodeURIComponent(name)}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.sessionToken}`,
      },
      cache: 'no-store',
    })

    if (response.status === 404) {
      return NextResponse.json({ success: true, data: null }, { status: 200 })
    }

    const { data, ok } = await fetchJson(response, 'Ingredients by-name GET')

    if (!ok) {
      return NextResponse.json(
        { success: false, error: errorMessage(data, 'Failed to fetch ingredient by name') },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Ingredients by-name GET API error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
