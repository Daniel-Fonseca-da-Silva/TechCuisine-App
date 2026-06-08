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

function createRequest(body?: unknown) {
  return {
    url: 'https://app.example.com/api/recipes/r1',
    headers: { get: () => null },
    cookies: { get: () => undefined },
    json: () => Promise.resolve(body ?? {}),
  }
}

const routeContext = { params: Promise.resolve({ id: 'r1' }) }

import { getSession } from '@/lib/get-session'
import { GET, PATCH, DELETE } from './route'
import { NextRequest } from 'next/server'

const authenticatedSession = {
  authenticated: true,
  user: { id: 'user-1' },
  sessionToken: 'session-token',
}
const unauthSession = { authenticated: false, user: null, sessionToken: null }

const mockRecipe = { id: 'r1', name: 'Bolo', status: 'pending', reference_portions: 4 }

describe('GET /api/recipes/[id]', () => {
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
    const response = await GET(createRequest() as unknown as NextRequest, routeContext)
    expect(response.status).toBe(500)
  })

  it('returns 401 when not authenticated', async () => {
    ;(getSession as jest.Mock).mockResolvedValue(unauthSession)
    const response = await GET(createRequest() as unknown as NextRequest, routeContext)
    expect(response.status).toBe(401)
  })

  it('returns recipe on success', async () => {
    ;(getSession as jest.Mock).mockResolvedValue(authenticatedSession)
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: () => Promise.resolve(mockRecipe),
    })
    const response = await GET(createRequest() as unknown as NextRequest, routeContext)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data.id).toBe('r1')
  })

  it('returns 404 when backend returns 404', async () => {
    ;(getSession as jest.Mock).mockResolvedValue(authenticatedSession)
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
      headers: { get: () => 'application/json' },
      json: () => Promise.resolve({ detail: 'Not found' }),
    })
    const response = await GET(createRequest() as unknown as NextRequest, routeContext)
    expect(response.status).toBe(404)
  })
})

describe('PATCH /api/recipes/[id]', () => {
  beforeEach(() => {
    process.env = { ...originalEnv, BACKEND_API_URL: 'https://api.example.com' }
    jest.clearAllMocks()
  })
  afterEach(() => {
    process.env = originalEnv
    global.fetch = originalFetch
  })

  it('returns 401 when not authenticated', async () => {
    ;(getSession as jest.Mock).mockResolvedValue(unauthSession)
    const response = await PATCH(createRequest({ name: 'Updated' }) as unknown as NextRequest, routeContext)
    expect(response.status).toBe(401)
  })

  it('returns updated recipe', async () => {
    ;(getSession as jest.Mock).mockResolvedValue(authenticatedSession)
    const updated = { ...mockRecipe, name: 'Updated' }
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: () => Promise.resolve(updated),
    })
    const response = await PATCH(createRequest({ name: 'Updated' }) as unknown as NextRequest, routeContext)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.data.name).toBe('Updated')
  })

  it('returns 403 on subscription error', async () => {
    ;(getSession as jest.Mock).mockResolvedValue(authenticatedSession)
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 403,
      headers: { get: () => 'application/json' },
      json: () => Promise.resolve({ detail: 'not available for your subscription plan' }),
    })
    const response = await PATCH(createRequest({ name: 'x' }) as unknown as NextRequest, routeContext)
    expect(response.status).toBe(403)
  })
})

describe('DELETE /api/recipes/[id]', () => {
  beforeEach(() => {
    process.env = { ...originalEnv, BACKEND_API_URL: 'https://api.example.com' }
    jest.clearAllMocks()
  })
  afterEach(() => {
    process.env = originalEnv
    global.fetch = originalFetch
  })

  it('returns 401 when not authenticated', async () => {
    ;(getSession as jest.Mock).mockResolvedValue(unauthSession)
    const response = await DELETE(createRequest() as unknown as NextRequest, routeContext)
    expect(response.status).toBe(401)
  })

  it('returns success on 204', async () => {
    ;(getSession as jest.Mock).mockResolvedValue(authenticatedSession)
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 204,
      headers: { get: () => '' },
    })
    const response = await DELETE(createRequest() as unknown as NextRequest, routeContext)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
  })

  it('returns error on backend failure', async () => {
    ;(getSession as jest.Mock).mockResolvedValue(authenticatedSession)
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
      headers: { get: () => 'application/json' },
      json: () => Promise.resolve({ detail: 'Not found' }),
    })
    const response = await DELETE(createRequest() as unknown as NextRequest, routeContext)
    expect(response.status).toBe(404)
    const data = await response.json()
    expect(data.success).toBe(false)
  })

  it('returns 500 on network error', async () => {
    ;(getSession as jest.Mock).mockResolvedValue(authenticatedSession)
    global.fetch = jest.fn().mockRejectedValueOnce(new Error('network'))
    const response = await DELETE(createRequest() as unknown as NextRequest, routeContext)
    expect(response.status).toBe(500)
  })
})
