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

function createRequest() {
  return {} as unknown as NextRequest
}

import { getSession } from '@/lib/get-session'
import { GET } from './route'
import { NextRequest } from 'next/server'

describe('GET /api/user/me', () => {
  beforeEach(() => {
    process.env = { ...originalEnv }
    process.env.BACKEND_API_URL = 'https://api.example.com'
  })
  afterEach(() => {
    process.env = originalEnv
    global.fetch = originalFetch
    jest.clearAllMocks()
  })

  it('returns 401 when session is not authenticated', async () => {
    (getSession as jest.Mock).mockResolvedValue({ authenticated: false, user: null })
    const request = createRequest()
    const response = await GET(request)
    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.error).toBe('Not authenticated')
  })

  it('returns 200 and user data when session and backend succeed', async () => {
    (getSession as jest.Mock).mockResolvedValue({
      authenticated: true,
      user: { id: 'user-1', name: 'U', email: 'u@x.com', image: null },
      sessionToken: 'session-token',
    })
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      headers: { get: () => 'application/json' },
      json: () => Promise.resolve({ name: 'User', email: 'u@x.com' }),
    })
    const request = createRequest()
    const response = await GET(request)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data).toEqual({ name: 'User', email: 'u@x.com' })
  })
})
