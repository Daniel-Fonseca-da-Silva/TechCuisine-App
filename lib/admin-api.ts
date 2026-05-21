import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/get-session'

const BACKEND_API_URL = process.env.BACKEND_API_URL

export interface AdminSessionResult {
  userId: string
  sessionToken: string
}

export async function getAdminSession(request: NextRequest): Promise<NextResponse | AdminSessionResult> {
  const session = await getSession(request)

  if (!session.authenticated || !session.sessionToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  return {
    userId: session.user.id,
    sessionToken: session.sessionToken
  }
}

export function getAdminBackendUrl(path: string, searchParams?: URLSearchParams): string {
  const url = `${BACKEND_API_URL}/admin${path}`
  if (searchParams?.toString()) {
    return `${url}?${searchParams.toString()}`
  }
  return url
}

export function adminHeaders(userId: string, sessionToken: string): Record<string, string> {
  const staticToken = process.env.BACKEND_STATIC_TOKEN ?? process.env.BACKEND_APIKEY ?? ''
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${sessionToken}`,
    'X-User-ID': userId,
    'X-Static-Token': staticToken
  }
}
