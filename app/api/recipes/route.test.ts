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

function createRequest(queryParams: Record<string, string> = {}) {
  const params = new URLSearchParams(queryParams)
  const url = `https://app.example.com/api/recipes${params.toString() ? `?${params}` : ''}`
  return {
    url,
    nextUrl: { origin: 'https://app.example.com' },
    headers: { get: () => null },
    cookies: { get: () => undefined },
  } as unknown as NextRequest
}

import { getSession } from '@/lib/get-session'
import { GET } from './route'
import { NextRequest } from 'next/server'

const authenticatedSession = {
  authenticated: true,
  user: { id: 'user-1', name: 'U', email: 'u@x.com' },
  sessionToken: 'session-token',
}

const unauthSession = { authenticated: false, user: null, sessionToken: null }

describe('GET /api/recipes', () => {
  beforeEach(() => {
    process.env = { ...originalEnv, BACKEND_API_URL: 'https://api.example.com' }
    jest.clearAllMocks()
  })
  afterEach(() => {
    process.env = originalEnv
    global.fetch = originalFetch
  })

  it('returns 500 when BACKEND_API_URL is not set', async () => {
    delete process.env.BACKEND_API_URL
    ;(getSession as jest.Mock).mockResolvedValue(authenticatedSession)
    const response = await GET(createRequest())
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.success).toBe(false)
  })

  it('returns 401 when session is not authenticated', async () => {
    ;(getSession as jest.Mock).mockResolvedValue(unauthSession)
    const response = await GET(createRequest())
    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.error).toBe('Not authenticated')
  })

  it('calls /recipes/ with Bearer token', async () => {
    ;(getSession as jest.Mock).mockResolvedValue(authenticatedSession)
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: () => Promise.resolve({ items: [], next_cursor: null }),
    })
    await GET(createRequest())
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.com/recipes/',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer session-token' }),
      })
    )
  })

  it('forwards cursor and limit query params to backend', async () => {
    ;(getSession as jest.Mock).mockResolvedValue(authenticatedSession)
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: () => Promise.resolve({ items: [], next_cursor: null }),
    })
    await GET(createRequest({ cursor: 'abc123', limit: '10' }))
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.com/recipes/?cursor=abc123&limit=10',
      expect.anything()
    )
  })

  it('returns 200 and paginated data on success', async () => {
    ;(getSession as jest.Mock).mockResolvedValue(authenticatedSession)
    const mockData = {
      items: [{ id: 'r1', name: 'Bolo', status: 'pending' }],
      next_cursor: 'cursor-xyz',
    }
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: () => Promise.resolve(mockData),
    })
    const response = await GET(createRequest())
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data.items).toHaveLength(1)
    expect(data.data.next_cursor).toBe('cursor-xyz')
  })

  it('returns backend error status on failure', async () => {
    ;(getSession as jest.Mock).mockResolvedValue(authenticatedSession)
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 422,
      headers: { get: () => 'application/json' },
      json: () => Promise.resolve({ detail: 'Invalid cursor' }),
    })
    const response = await GET(createRequest({ cursor: 'bad' }))
    expect(response.status).toBe(422)
    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.error).toBe('Invalid cursor')
  })

  it('normalizes FastAPI detail list error', async () => {
    ;(getSession as jest.Mock).mockResolvedValue(authenticatedSession)
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 422,
      headers: { get: () => 'application/json' },
      json: () => Promise.resolve({ detail: [{ msg: 'field required', loc: ['query', 'limit'] }] }),
    })
    const response = await GET(createRequest())
    const data = await response.json()
    expect(data.error).toBe('field required')
  })

  it('returns 500 on internal fetch error', async () => {
    ;(getSession as jest.Mock).mockResolvedValue(authenticatedSession)
    global.fetch = jest.fn().mockRejectedValueOnce(new Error('network'))
    const response = await GET(createRequest())
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.error).toBe('Internal server error')
  })
})
