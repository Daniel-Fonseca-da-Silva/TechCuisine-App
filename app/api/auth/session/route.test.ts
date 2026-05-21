jest.mock('next/server', () => ({
  NextRequest: function () {},
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: () => Promise.resolve(body),
      cookies: { set: jest.fn() },
    }),
  },
}))

jest.mock('@/lib/auth-config', () => ({
  AUTH_CONFIG: {
    ACCESS_COOKIE_NAME: 'tc-access',
    ACCESS_TOKEN_EXPIRE_MINUTES: 30,
    COOKIE_HTTP_ONLY: true,
    COOKIE_SECURE: false,
    COOKIE_SAME_SITE: 'lax',
  },
}))

const mockGetSession = jest.fn()
jest.mock('@/lib/get-session', () => ({
  getSession: (...args: unknown[]) => mockGetSession(...args),
}))

import { GET } from './route'
import { NextRequest } from 'next/server'

function createRequest() {
  return {
    cookies: { get: () => undefined },
  } as NextRequest
}

describe('GET /api/auth/session', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns authenticated false when getSession says so', async () => {
    mockGetSession.mockResolvedValue({ authenticated: false, user: null })
    const request = createRequest()
    const response = await GET(request)
    const data = await response.json()
    expect(data.authenticated).toBe(false)
    expect(data.user).toBeNull()
  })

  it('returns authenticated true with user', async () => {
    mockGetSession.mockResolvedValue({
      authenticated: true,
      user: { id: 'u1', name: 'User', email: 'u@example.com', image: null },
      sessionToken: 't',
    })
    const request = createRequest()
    const response = await GET(request)
    const data = await response.json()
    expect(data.authenticated).toBe(true)
    expect(data.user).toMatchObject({ id: 'u1', email: 'u@example.com' })
  })
})
