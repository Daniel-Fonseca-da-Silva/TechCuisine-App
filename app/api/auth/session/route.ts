import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/get-session'
import { AUTH_CONFIG } from '@/lib/auth-config'

export async function GET(request: NextRequest) {
  try {
    const result = await getSession(request)
    const response = NextResponse.json({ authenticated: result.authenticated, user: result.user })

    if (result.authenticated && result.newAccessToken) {
      response.cookies.set(AUTH_CONFIG.ACCESS_COOKIE_NAME, result.newAccessToken, {
        httpOnly: AUTH_CONFIG.COOKIE_HTTP_ONLY,
        secure: AUTH_CONFIG.COOKIE_SECURE,
        sameSite: AUTH_CONFIG.COOKIE_SAME_SITE,
        path: '/',
        maxAge: AUTH_CONFIG.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
      })
    }

    return response
  } catch (error) {
    console.error('Error checking session:', error)
    return NextResponse.json({ authenticated: false, user: null })
  }
}
