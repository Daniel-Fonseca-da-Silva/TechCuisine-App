import { NextRequest } from 'next/server'
import { AUTH_CONFIG } from '@/lib/auth-config'

export interface GetSessionUser {
  id: string
  name: string
  email: string
  image: null
}

export type GetSessionResult =
  | { authenticated: true; user: GetSessionUser; sessionToken: string; newAccessToken?: string }
  | { authenticated: false; user: null }

async function fetchMe(accessToken: string): Promise<GetSessionUser | null> {
  try {
    const res = await fetch(`${process.env.BACKEND_API_URL}/users/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res.ok) return null
    const data = await res.json()
    return { id: data.id, name: data.username, email: data.email, image: null }
  } catch {
    return null
  }
}

async function doRefresh(refreshToken: string): Promise<string | null> {
  try {
    const res = await fetch(`${process.env.BACKEND_API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${refreshToken}` },
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.access_token ?? null
  } catch {
    return null
  }
}

export async function getSession(request: NextRequest): Promise<GetSessionResult> {
  try {
    const accessToken = request.cookies.get(AUTH_CONFIG.ACCESS_COOKIE_NAME)?.value
    const refreshToken = request.cookies.get(AUTH_CONFIG.REFRESH_COOKIE_NAME)?.value

    if (!accessToken && !refreshToken) {
      return { authenticated: false, user: null }
    }

    if (accessToken) {
      const user = await fetchMe(accessToken)
      if (user) return { authenticated: true, user, sessionToken: accessToken }
    }

    if (!refreshToken) return { authenticated: false, user: null }

    const newAccessToken = await doRefresh(refreshToken)
    if (!newAccessToken) return { authenticated: false, user: null }

    const user = await fetchMe(newAccessToken)
    if (!user) return { authenticated: false, user: null }

    return { authenticated: true, user, sessionToken: newAccessToken, newAccessToken }
  } catch (error) {
    console.error('Error checking session:', error)
    return { authenticated: false, user: null }
  }
}
