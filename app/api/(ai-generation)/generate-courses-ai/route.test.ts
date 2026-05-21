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

const originalFetch = global.fetch
const originalEnv = process.env

function createRequest(body: object, sessionToken?: string) {
  return {
    json: () => Promise.resolve(body),
    cookies: {
      get: () => (sessionToken ? { value: sessionToken } : undefined),
    },
  } as NextRequest
}

import { POST } from './route'

describe('POST /api/(ai-generation)/generate-courses-ai', () => {
  beforeEach(() => {
    process.env = { ...originalEnv }
    process.env.BACKEND_API_URL = 'https://api.example.com'
  })

  afterEach(() => {
    process.env = originalEnv
    global.fetch = originalFetch
    jest.restoreAllMocks()
  })

  it('returns 400 when content is missing', async () => {
    const request = createRequest({}, 'token')
    const response = await POST(request)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.error).toBe('Content is required')
  })

  it('returns 401 when session token is missing', async () => {
    const request = createRequest({ content: 'Hello' })
    const response = await POST(request)
    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.error).toBe('User not authenticated')
  })

  it('returns 200 and calls backend with courses endpoint when valid', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ result: 'ok' }),
    })
    const request = createRequest({ content: 'Course list' }, 'session-1')
    const response = await POST(request)
    expect(response.status).toBe(200)
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/generate-courses-ai'),
      expect.any(Object)
    )
  })
})
