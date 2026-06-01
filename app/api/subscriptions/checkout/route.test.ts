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

function createPostRequest(body: Record<string, unknown>) {
  return {
    json: () => Promise.resolve(body),
  } as unknown as NextRequest
}

import { getSession } from '@/lib/get-session'
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
    plan: 'tech_cuisine',
    success_url: 'https://app.example.com/plans?stripe=success',
    cancel_url: 'https://app.example.com/plans',
  }

  it('returns 401 when session token is missing', async () => {
    ;(getSession as jest.Mock).mockResolvedValue(unauthSession)
    const request = createPostRequest(validBody)
    const response = await POST(request)
    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.error).toBe('Not authenticated')
  })

  it('returns 400 when plan is not allowed', async () => {
    ;(getSession as jest.Mock).mockResolvedValue(authenticatedSession)
    const request = createPostRequest({
      ...validBody,
      plan: 'enterprise',
    })
    const response = await POST(request)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.success).toBe(false)
    expect(String(data.error)).toContain('Invalid plan')
  })

  it('returns 400 for legacy plan names', async () => {
    ;(getSession as jest.Mock).mockResolvedValue(authenticatedSession)
    for (const plan of ['simple', 'medium', 'ultra', 'business']) {
      const request = createPostRequest({ ...validBody, plan })
      const response = await POST(request)
      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.success).toBe(false)
    }
  })

  it('proxies tech_cuisine plan to backend', async () => {
    ;(getSession as jest.Mock).mockResolvedValue(authenticatedSession)
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          session_id: 'cs_1',
          checkout_url: 'https://checkout.stripe.com/c/pay/cs_1',
        }),
    })
    const request = createPostRequest(validBody)
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
          plan: 'tech_cuisine',
          success_url: validBody.success_url,
          cancel_url: validBody.cancel_url,
        }),
      })
    )
  })
})
