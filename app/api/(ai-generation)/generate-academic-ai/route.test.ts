import type { NextRequest } from 'next/server'

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

const originalEnv = process.env
const originalFetch = global.fetch

function createRequest(body: object, sessionToken?: string) {
  return {
    json: () => Promise.resolve(body),
    cookies: { get: () => (sessionToken ? { value: sessionToken } : undefined) },
  } as NextRequest
}

import { POST } from './route'

describe('POST /api/(ai-generation)/generate-academic-ai', () => {
  beforeEach(() => {
    process.env = { ...originalEnv }
    process.env.BACKEND_API_URL = 'https://api.example.com'
  })
  afterEach(() => {
    process.env = originalEnv
    global.fetch = originalFetch
  })

  it('returns 401 when session token is missing', async () => {
    const request = createRequest({ content: 'text' })
    const response = await POST(request)
    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.error).toBe('User not authenticated')
  })
})
