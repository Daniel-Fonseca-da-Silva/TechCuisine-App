import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession, getAdminBackendUrl, adminHeaders } from '@/lib/admin-api'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession(request)
  if (session instanceof NextResponse) return session

  const { id } = await params
  const { userId, sessionToken } = session
  const url = getAdminBackendUrl(`/users/${encodeURIComponent(id)}/toggle-admin`)

  const response = await fetch(url, {
    method: 'PATCH',
    headers: adminHeaders(userId, sessionToken),
    cache: 'no-store'
  })

  const data = await response.json()
  return NextResponse.json(data, { status: response.status })
}
