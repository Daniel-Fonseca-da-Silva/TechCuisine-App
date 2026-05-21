import { NextRequest, NextResponse } from 'next/server'

const BACKEND_API_URL = process.env.BACKEND_API_URL

export async function POST(request: NextRequest) {
  if (!BACKEND_API_URL) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }

  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 })
    }

    const apiResponse = await fetch(`${BACKEND_API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    if (!apiResponse.ok) {
      const data = await apiResponse.json().catch(() => ({}))
      return NextResponse.json(
        { success: false, error: data.detail || 'Error when sending password reset instructions' },
        { status: apiResponse.status },
      )
    }

    return NextResponse.json({ success: true, message: 'Password reset instructions sent' })
  } catch (error) {
    console.error('Forgot password API error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
