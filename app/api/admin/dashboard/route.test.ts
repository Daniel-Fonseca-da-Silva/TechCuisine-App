jest.mock('next/server', () => {
  class NextResponse {
    constructor(public body?: unknown, public init?: { status?: number }) {}
    static json(body: unknown, init?: { status?: number }) {
      return Object.assign(new NextResponse(body, init), {
        status: init?.status ?? 200,
        json: () => Promise.resolve(body),
      })
    }
  }
  return {
    NextRequest: function () {},
    NextResponse,
  }
})

jest.mock('@/lib/admin-api', () => ({
  getAdminSession: jest.fn(),
  getAdminBackendUrl: jest.fn(),
  adminHeaders: jest.fn(),
}))

import {
  getAdminSession,
  getAdminBackendUrl,
  adminHeaders,
} from '@/lib/admin-api'

const originalFetch = global.fetch

import { NextRequest, NextResponse } from 'next/server'
import { GET } from './route'

describe('GET /api/admin/dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(getAdminBackendUrl as jest.Mock).mockReturnValue('https://api.example.com/admin/dashboard')
    ;(adminHeaders as jest.Mock).mockReturnValue({ Authorization: 'Bearer token' })
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('returns admin error response when session is not admin', async () => {
    ;(getAdminSession as jest.Mock).mockResolvedValue(NextResponse.json({ error: 'Forbidden' }, { status: 403 }))
    const request = {} as NextRequest
    const response = await GET(request)
    expect(response.status).toBe(403)
  })

  it('returns dashboard data when backend succeeds', async () => {
    ;(getAdminSession as jest.Mock).mockResolvedValue({ userId: 'u1', sessionToken: 't1' })
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ stats: {} }),
    })
    const request = {} as NextRequest
    const response = await GET(request)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toHaveProperty('stats')
  })
})
