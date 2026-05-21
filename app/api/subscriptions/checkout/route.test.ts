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

function createPostRequest(
  sessionToken: string | undefined,
  body: Record<string, unknown>
) {
  return {
    cookies: { get: () => (sessionToken ? { value: sessionToken } : undefined) },
    json: () => Promise.resolve(body),
  } as unknown as NextRequest
}

import { POST } from './route'
import { NextRequest } from 'next/server'

describe('POST /api/subscriptions/checkout', () => {
  beforeEach(() => {
    process.env = { ...originalEnv }
    process.env.BACKEND_API_URL = 'https://api.example.com'
  })
  afterEach(() => {
    process.env = originalEnv
    global.fetch = originalFetch
  })

  const validBody = {
    plan: 'simple',
    success_url: 'https://app.example.com/plans?stripe=success',
    cancel_url: 'https://app.example.com/plans',
  }

  it('returns 401 when session token is missing', async () => {
    const request = createPostRequest(undefined, validBody)
    const response = await POST(request)
    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.error).toBe('Not authenticated')
  })

  it('returns 400 when plan is not allowed', async () => {
    const request = createPostRequest('session-123', {
      ...validBody,
      plan: 'enterprise',
    })
    const response = await POST(request)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.success).toBe(false)
    expect(String(data.error)).toContain('Invalid plan')
  })

  it('returns 400 for legacy plans (medium, ultra, business)', async () => {
    for (const plan of ['medium', 'ultra', 'business']) {
      const request = createPostRequest('session-123', { ...validBody, plan })
      const response = await POST(request)
      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.success).toBe(false)
    }
  })

  it('proxies simple plan to backend', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          session_id: 'cs_1',
          checkout_url: 'https://checkout.stripe.com/c/pay/cs_1',
        }),
    })
    const request = createPostRequest('session-123', validBody)
    const response = await POST(request)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringMatching(/subscriptions\/checkout$/),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer session-123',
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({
          plan: 'simple',
          success_url: validBody.success_url,
          cancel_url: validBody.cancel_url,
        }),
      })
    )
  })
})
