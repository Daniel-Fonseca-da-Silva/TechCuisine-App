import { NextResponse } from 'next/server'
import { AUTH_CONFIG } from '@/lib/auth-config'

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logout completed successfully' })
  response.cookies.delete(AUTH_CONFIG.ACCESS_COOKIE_NAME)
  response.cookies.delete(AUTH_CONFIG.REFRESH_COOKIE_NAME)
  return response
}
