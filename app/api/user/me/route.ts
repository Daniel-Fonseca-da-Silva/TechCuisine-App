import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/get-session'

const BACKEND_API_URL = process.env.BACKEND_API_URL

export async function GET(request: NextRequest) {
  try {
    if (!BACKEND_API_URL) {
      console.error('User GET /api/user/me - BACKEND_API_URL is not configured')
      return NextResponse.json(
        { success: false, error: 'BACKEND_API_URL is not configured' },
        { status: 500 }
      )
    }

    const session = await getSession(request)

    if (!session.authenticated || !session.sessionToken) {
      console.warn('User GET /api/user/me - not authenticated')
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const sessionToken = session.sessionToken

    const backendUrl = `${BACKEND_API_URL}/users/me`

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionToken}`
      },
      cache: 'no-store'
    })

    const backendContentType = response.headers.get('content-type') || ''

    if (!backendContentType.includes('application/json')) {
      const bodyText = await response.text().catch(() => '')
      console.error(
        'User GET /api/user/me - backend response is not JSON. Body snippet:',
        bodyText.slice(0, 300)
      )

      return NextResponse.json(
        { success: false, error: 'Invalid backend response format' },
        { status: 502 }
      )
    }

    const data = await response.json()

    if (!response.ok) {
      console.error('User GET /api/user/me - backend error response', {
        status: response.status,
        errorMessage: data?.message || data?.error
      })

      return NextResponse.json(
        {
          success: false,
          error: data?.message || data?.error || 'Failed to fetch user'
        },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('User GET API error /api/user/me:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!BACKEND_API_URL) {
      console.error('User PATCH /api/user/me - BACKEND_API_URL is not configured')
      return NextResponse.json(
        { success: false, error: 'BACKEND_API_URL is not configured' },
        { status: 500 }
      )
    }

    const session = await getSession(request)

    if (!session.authenticated || !session.sessionToken) {
      console.warn('User PATCH /api/user/me - not authenticated')
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const sessionToken = session.sessionToken

    const body = await request.json()

    const backendUrl = `${BACKEND_API_URL}/users/me`

    const response = await fetch(backendUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionToken}`
      },
      body: JSON.stringify(body),
      cache: 'no-store'
    })

    const backendContentType = response.headers.get('content-type') || ''

    if (!backendContentType.includes('application/json')) {
      const bodyText = await response.text().catch(() => '')
      console.error(
        'User PATCH /api/user/me - backend response is not JSON. Body snippet:',
        bodyText.slice(0, 300)
      )

      return NextResponse.json(
        { success: false, error: 'Invalid backend response format' },
        { status: 502 }
      )
    }

    const data = await response.json()

    if (!response.ok) {
      console.error('User PATCH /api/user/me - backend error response', {
        status: response.status,
        errorMessage: data?.message || data?.error
      })

      return NextResponse.json(
        {
          success: false,
          error: data?.message || data?.error || 'Failed to update user'
        },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('User PATCH API error /api/user/me:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
