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

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const BACKEND_API_URL = process.env.BACKEND_API_URL
    if (!BACKEND_API_URL) {
      console.error('Ingredient prices GET - BACKEND_API_URL is not configured')
      return NextResponse.json({ success: false, error: 'BACKEND_API_URL is not configured' }, { status: 500 })
    }

    const session = await getSession(request)
    if (!session.authenticated || !session.sessionToken) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const qs = searchParams.toString()
    const url = `${BACKEND_API_URL}/ingredients/${id}/prices${qs ? `?${qs}` : ''}`

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${session.sessionToken}` },
      cache: 'no-store',
    })

    const { data, ok } = await fetchJson(response, 'Ingredient prices GET')
    if (!ok) {
      return NextResponse.json(
        { success: false, error: errorMessage(data, 'Failed to load price history') },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Ingredient prices GET API error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const BACKEND_API_URL = process.env.BACKEND_API_URL
    if (!BACKEND_API_URL) {
      console.error('Ingredient prices POST - BACKEND_API_URL is not configured')
      return NextResponse.json({ success: false, error: 'BACKEND_API_URL is not configured' }, { status: 500 })
    }

    const session = await getSession(request)

    if (!session.authenticated || !session.sessionToken) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const response = await fetch(`${BACKEND_API_URL}/ingredients/${id}/prices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.sessionToken}`,
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    })

    const { data, ok } = await fetchJson(response, 'Ingredient prices POST')

    if (!ok) {
      return NextResponse.json(
        { success: false, error: errorMessage(data, 'Failed to record price observation') },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    console.error('Ingredient prices POST API error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
