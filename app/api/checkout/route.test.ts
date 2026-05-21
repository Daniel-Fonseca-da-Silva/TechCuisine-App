jest.mock('next/server', () => ({
  NextRequest: function () {},
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: () => Promise.resolve(body),
    }),
  },
}))

const mockGetSession = jest.fn()
jest.mock('@/lib/get-session', () => ({
  getSession: (...args: unknown[]) => mockGetSession(...args),
}))

const mockCreate = jest.fn()
jest.mock('stripe', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: mockCreate,
      },
    },
  })),
}))

const originalEnv = process.env

function createRequest(_accessToken?: string, origin?: string) {
  return {
    cookies: { get: () => undefined },
    headers: { get: (name: string) => (name === 'origin' ? origin ?? 'https://app.example.com' : null) },
  } as NextRequest
}

import { POST } from './route'
import { NextRequest } from 'next/server'

describe('POST /api/checkout', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env = { ...originalEnv }
    process.env.STRIPE_SECRET_KEY = 'sk_test'
    process.env.STRIPE_PRICE_ID = 'price_123'
    mockCreate.mockResolvedValue({
      id: 'cs_123',
      client_secret: 'secret_123',
    })
  })
  afterEach(() => {
    process.env = originalEnv
  })

  it('returns 401 when not authenticated', async () => {
    mockGetSession.mockResolvedValue({ authenticated: false, user: null })
    const request = createRequest()
    const response = await POST(request)
    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.error).toBe('Unauthorized')
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('returns checkout session when authenticated', async () => {
    mockGetSession.mockResolvedValue({
      authenticated: true,
      user: { id: 'u1', name: 'User', email: 'user@example.com', image: null },
      sessionToken: 'jwt',
    })
    const request = createRequest(undefined, 'https://app.example.com')
    const response = await POST(request)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.id).toBe('cs_123')
    expect(data.client_secret).toBe('secret_123')
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        customer_email: 'user@example.com',
        mode: 'subscription',
      })
    )
  })
})
