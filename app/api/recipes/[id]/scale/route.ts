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

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const BACKEND_API_URL = process.env.BACKEND_API_URL
    if (!BACKEND_API_URL) {
      return NextResponse.json({ success: false, error: 'BACKEND_API_URL is not configured' }, { status: 500 })
    }

    const session = await getSession(request)
    if (!session.authenticated || !session.sessionToken) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const portionsParam = searchParams.get('portions')

    if (!portionsParam) {
      return NextResponse.json({ success: false, error: 'portions query parameter is required' }, { status: 400 })
    }

    const portions = parseInt(portionsParam, 10)
    if (!Number.isInteger(portions) || portions <= 0) {
      return NextResponse.json({ success: false, error: 'portions must be a positive integer' }, { status: 400 })
    }

    const response = await fetch(`${BACKEND_API_URL}/recipes/${id}/scale?portions=${portions}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.sessionToken}`,
      },
      cache: 'no-store',
    })

    const ct = response.headers.get('content-type') || ''
    if (!ct.includes('application/json')) {
      const snippet = await response.text().catch(() => '')
      console.error('Recipe scale GET - backend response is not JSON. Snippet:', snippet.slice(0, 300))
      return NextResponse.json({ success: false, error: 'Failed to scale recipe' }, { status: 500 })
    }

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: errorMessage(data, 'Failed to scale recipe') },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Recipe scale GET API error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
