import { NextRequest, NextResponse } from 'next/server'
import { AUTH_CONFIG } from '@/lib/auth-config'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ success: false, code: 'MISSING_CREDENTIALS' }, { status: 400 })
    }

    const form = new URLSearchParams()
    form.set('username', username)
    form.set('password', password)

    const apiResponse = await fetch(`${process.env.BACKEND_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    })

    if (!apiResponse.ok) {
      const status = apiResponse.status
      if (status === 401 || status === 403) {
        return NextResponse.json({ success: false, code: 'INVALID_CREDENTIALS' }, { status: 401 })
      }
      return NextResponse.json({ success: false, code: 'AUTH_FAILED' }, { status: status })
    }

    const { access_token, refresh_token } = await apiResponse.json()

    const cookieBase = {
      httpOnly: AUTH_CONFIG.COOKIE_HTTP_ONLY,
      secure: AUTH_CONFIG.COOKIE_SECURE,
      sameSite: AUTH_CONFIG.COOKIE_SAME_SITE,
      path: '/',
    }

    const response = NextResponse.json({ success: true })
    response.cookies.set(AUTH_CONFIG.ACCESS_COOKIE_NAME, access_token, {
      ...cookieBase,
      maxAge: AUTH_CONFIG.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    })
    response.cookies.set(AUTH_CONFIG.REFRESH_COOKIE_NAME, refresh_token, {
      ...cookieBase,
      maxAge: AUTH_CONFIG.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ success: false, code: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
