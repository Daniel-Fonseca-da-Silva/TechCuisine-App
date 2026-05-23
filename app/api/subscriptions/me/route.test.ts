jest.mock('next/server', () => ({
  NextRequest: function () {},
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: () => Promise.resolve(body),
    }),
  },
}))

jest.mock('@/lib/get-session', () => ({
  getSession: jest.fn(),
}))

const originalFetch = global.fetch
const originalEnv = process.env

const authenticatedSession = {
  authenticated: true as const,
  user: { id: 'u1', name: 'User', email: 'u@example.com', image: null },
  sessionToken: 'session-123',
}

const unauthSession = { authenticated: false as const, user: null }

function createRequest() {
  return {} as unknown as NextRequest
}

import { getSession } from '@/lib/get-session'
import { GET } from './route'
import { NextRequest } from 'next/server'

describe('GET /api/subscriptions/me', () => {
  beforeEach(() => {
    process.env = { ...originalEnv }
    process.env.BACKEND_API_URL = 'https://api.example.com'
  })
  afterEach(() => {
    process.env = originalEnv
    global.fetch = originalFetch
  })

  it('returns 401 when session token is missing', async () => {
    ;(getSession as jest.Mock).mockResolvedValue(unauthSession)
    const request = createRequest()
    const response = await GET(request)
    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.error).toBe('Not authenticated')
  })

  it('returns 200 and subscription data when backend succeeds', async () => {
    ;(getSession as jest.Mock).mockResolvedValue(authenticatedSession)
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ plan: 'pro', status: 'active' }),
    })
    const request = createRequest()
    const response = await GET(request)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data).toEqual({ plan: 'pro', status: 'active' })
  })
})
