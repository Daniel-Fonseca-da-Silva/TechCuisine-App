jest.mock('next/server', () => ({
  NextRequest: function () {},
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: () => Promise.resolve(body),
    }),
  },
}))

jest.mock('@/lib/auth-config', () => ({
  AUTH_CONFIG: { SESSION_COOKIE_NAME: 'session-token' },
}))

const originalFetch = global.fetch
const originalEnv = process.env

function createRequest(sessionToken?: string) {
  return {
    cookies: { get: () => (sessionToken ? { value: sessionToken } : undefined) },
  } as unknown as NextRequest
}

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
    const request = createRequest()
    const response = await GET(request)
    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.error).toBe('Not authenticated')
  })

  it('returns 200 and subscription data when backend succeeds', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ plan: 'pro', status: 'active' }),
    })
    const request = createRequest('session-123')
    const response = await GET(request)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data).toEqual({ plan: 'pro', status: 'active' })
  })
})
