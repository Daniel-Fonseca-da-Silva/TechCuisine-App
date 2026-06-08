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

const originalFetch = global.fetch
const originalEnv = process.env

function createRequest(body: object) {
  return { json: () => Promise.resolve(body) } as NextRequest
}

import { POST } from './route'

describe('POST /api/auth/forgot-password', () => {
  beforeEach(() => {
    process.env = { ...originalEnv }
    process.env.BACKEND_API_URL = 'https://api.example.com'
  })

  afterEach(() => {
    process.env = originalEnv
    global.fetch = originalFetch
    jest.restoreAllMocks()
  })

  it('returns 400 when email is missing', async () => {
    const request = createRequest({})
    const response = await POST(request)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.error).toBe('Email is required')
  })

  it('returns 200 and success when backend succeeds', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    })
    const request = createRequest({ email: 'user@example.com' })
    const response = await POST(request)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.message).toBe('Password reset instructions sent')
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('auth/forgot-password'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'user@example.com' }),
      })
    )
  })
})
