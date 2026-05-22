import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/get-session'

function extractBackendError(parsed: unknown): string | undefined {
  if (!parsed || typeof parsed !== 'object') return undefined
  const o = parsed as Record<string, unknown>
  if (typeof o.error === 'string') return o.error
  if (typeof o.detail === 'string') return o.detail
  const detail = o.detail
  if (Array.isArray(detail) && detail[0] && typeof detail[0] === 'object') {
    const first = detail[0] as Record<string, unknown>
    if (typeof first.msg === 'string') return first.msg
  }
  return undefined
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request)

    if (!session.authenticated || !session.sessionToken) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    const sessionToken = session.sessionToken

    const backendBaseUrl = process.env.BACKEND_API_URL
    if (!backendBaseUrl) {
      return NextResponse.json(
        { success: false, error: 'Backend not configured' },
        { status: 503 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file')
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid file (use field "file")' },
        { status: 400 }
      )
    }

    const outgoing = new FormData()
    outgoing.append('file', file)

    const response = await fetch(`${backendBaseUrl}/configurations/current/avatar`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
      body: outgoing,
    })

    const text = await response.text()
    let data: { avatar_picture?: string | null; url?: string } = {}
    try {
      data = text ? JSON.parse(text) : {}
    } catch {
      if (!response.ok && text) {
        const preview = text.length > 200 ? `${text.slice(0, 200)}...` : text
        console.error('Upload profile: backend returned non-JSON body', { status: response.status, preview })
      }
    }

    if (!response.ok) {
      const message = extractBackendError(data) ?? 'Upload failed'
      return NextResponse.json({ success: false, error: message }, { status: response.status })
    }

    const url = data.avatar_picture ?? data.url ?? ''
    if (!url) {
      return NextResponse.json(
        { success: false, error: 'Upload succeeded but no image URL was returned' },
        { status: 502 }
      )
    }

    return NextResponse.json({ success: true, url })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const stack = error instanceof Error ? error.stack : undefined
    console.error('Upload profile image error:', message, stack ?? '')
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
