import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession, getAdminBackendUrl, adminHeaders } from '@/lib/admin-api'

export async function GET(request: NextRequest) {
  const session = await getAdminSession(request)
  if (session instanceof NextResponse) return session

  const { userId, sessionToken } = session
  const limit = request.nextUrl.searchParams.get('limit') || '10'
  const searchParams = new URLSearchParams({ limit })
  const cursor = request.nextUrl.searchParams.get('cursor')
  if (cursor) searchParams.set('cursor', cursor)
  const url = getAdminBackendUrl('/users', searchParams)

  const response = await fetch(url, {
    method: 'GET',
    headers: adminHeaders(userId, sessionToken),
    cache: 'no-store'
  })

  const data = await response.json()
  return NextResponse.json(data, { status: response.status })
}
