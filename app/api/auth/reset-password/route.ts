import { NextRequest, NextResponse } from 'next/server'

const BACKEND_API_URL = process.env.BACKEND_API_URL

export async function POST(request: NextRequest) {
  if (!BACKEND_API_URL) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }

  try {
    const { token, new_password } = await request.json()

    if (!token || !new_password) {
      return NextResponse.json(
        { success: false, error: 'Token and new_password are required' },
        { status: 400 },
      )
    }

    const apiResponse = await fetch(`${BACKEND_API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, new_password }),
    })

    if (!apiResponse.ok) {
      const data = await apiResponse.json().catch(() => ({}))
      return NextResponse.json(
        { success: false, error: data.detail || 'Failed to reset password' },
        { status: apiResponse.status },
      )
    }

    return NextResponse.json({ success: true, message: 'Password reset successfully' })
  } catch (error) {
    console.error('Reset password API error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
