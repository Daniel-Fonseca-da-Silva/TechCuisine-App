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

jest.mock('@/lib/token-cleanup', () => ({
  immediateCleanup: jest.fn(),
}))

import { immediateCleanup } from '@/lib/token-cleanup'
import { POST, GET } from './route'

const originalEnv = process.env

function createRequest(authHeader?: string) {
  return {
    headers: { get: (name: string) => (name === 'authorization' ? authHeader : null) },
  } as NextRequest
}

describe('POST /api/admin/cleanup-tokens', () => {
  beforeEach(() => {
    process.env = { ...originalEnv }
    ;(immediateCleanup as jest.Mock).mockResolvedValue(5)
  })
  afterEach(() => {
    process.env = originalEnv
  })

  it('returns 401 when ADMIN_CLEANUP_KEY is set and auth header does not match', async () => {
    process.env.ADMIN_CLEANUP_KEY = 'secret-key'
    const request = createRequest('Bearer wrong')
    const response = await POST(request)
    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.error).toBe('Unauthorized')
  })

  it('returns success and cleaned count when authorized', async () => {
    process.env.ADMIN_CLEANUP_KEY = 'secret-key'
    const request = createRequest('Bearer secret-key')
    const response = await POST(request)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.cleanedTokens).toBe(5)
    expect(immediateCleanup).toHaveBeenCalled()
  })

  it('returns success when ADMIN_CLEANUP_KEY is not set', async () => {
    delete process.env.ADMIN_CLEANUP_KEY
    const request = createRequest()
    const response = await POST(request)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
  })
})

describe('GET /api/admin/cleanup-tokens', () => {
  beforeEach(() => {
    ;(immediateCleanup as jest.Mock).mockResolvedValue(0)
  })

  it('returns success and cleaned count', async () => {
    const response = await GET()
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.cleanedTokens).toBe(0)
  })
})
