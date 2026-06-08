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
  const url = `https://app.example.com/api/recipes/r1/scale${params.toString() ? `?${params}` : ''}`
  return {
    url,
    headers: { get: () => null },
    cookies: { get: () => undefined },
  }
}

const routeContext = { params: Promise.resolve({ id: 'r1' }) }

import { getSession } from '@/lib/get-session'
import { GET } from './route'
import { NextRequest } from 'next/server'

const authenticatedSession = {
  authenticated: true,
  user: { id: 'user-1' },
  sessionToken: 'session-token',
}
const unauthSession = { authenticated: false, user: null, sessionToken: null }

const mockScaleResult = {
  recipe_id: 'r1',
  reference_portions: 4,
  desired_portions: 8,
  factor: '2.0',
  ingredient_lines: [],
  total_ingredient_cost: null,
  total_preparation_cost: null,
  total_recipe_cost: null,
  cost_per_portion: null,
  selling_price_per_portion: null,
  total_selling_price: null,
}

describe('GET /api/recipes/[id]/scale', () => {
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
    const response = await GET(createRequest({ portions: '8' }) as unknown as NextRequest, routeContext)
    expect(response.status).toBe(500)
  })

  it('returns 401 when not authenticated', async () => {
    ;(getSession as jest.Mock).mockResolvedValue(unauthSession)
    const response = await GET(createRequest({ portions: '8' }) as unknown as NextRequest, routeContext)
    expect(response.status).toBe(401)
  })

  it('returns 400 when portions is missing', async () => {
    ;(getSession as jest.Mock).mockResolvedValue(authenticatedSession)
    const response = await GET(createRequest() as unknown as NextRequest, routeContext)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.error).toContain('portions')
  })

  it('returns 400 when portions is not a positive integer', async () => {
    ;(getSession as jest.Mock).mockResolvedValue(authenticatedSession)
    const response = await GET(createRequest({ portions: '-1' }) as unknown as NextRequest, routeContext)
    expect(response.status).toBe(400)
  })

  it('returns 400 when portions is zero', async () => {
    ;(getSession as jest.Mock).mockResolvedValue(authenticatedSession)
    const response = await GET(createRequest({ portions: '0' }) as unknown as NextRequest, routeContext)
    expect(response.status).toBe(400)
  })

  it('returns scale result on success', async () => {
    ;(getSession as jest.Mock).mockResolvedValue(authenticatedSession)
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: () => Promise.resolve(mockScaleResult),
    })
    const response = await GET(createRequest({ portions: '8' }) as unknown as NextRequest, routeContext)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data.factor).toBe('2.0')
    expect(data.data.desired_portions).toBe(8)
  })

  it('calls backend with correct portions param', async () => {
    ;(getSession as jest.Mock).mockResolvedValue(authenticatedSession)
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: () => Promise.resolve(mockScaleResult),
    })
    await GET(createRequest({ portions: '12' }) as unknown as NextRequest, routeContext)
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.com/recipes/r1/scale?portions=12',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer session-token' }),
      })
    )
  })

  it('returns backend error on failure', async () => {
    ;(getSession as jest.Mock).mockResolvedValue(authenticatedSession)
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
      headers: { get: () => 'application/json' },
      json: () => Promise.resolve({ detail: 'Recipe not found' }),
    })
    const response = await GET(createRequest({ portions: '8' }) as unknown as NextRequest, routeContext)
    expect(response.status).toBe(404)
    const data = await response.json()
    expect(data.success).toBe(false)
  })

  it('returns 500 on network error', async () => {
    ;(getSession as jest.Mock).mockResolvedValue(authenticatedSession)
    global.fetch = jest.fn().mockRejectedValueOnce(new Error('network'))
    const response = await GET(createRequest({ portions: '8' }) as unknown as NextRequest, routeContext)
    expect(response.status).toBe(500)
  })
})
