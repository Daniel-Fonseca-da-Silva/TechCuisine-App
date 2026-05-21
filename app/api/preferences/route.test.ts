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

jest.mock('@/lib/get-session', () => ({
  getSession: jest.fn(),
}))

const originalFetch = global.fetch
const originalEnv = process.env

function createRequest(body?: unknown) {
  return {
    nextUrl: { origin: 'https://app.example.com' },
    headers: { get: () => null },
    cookies: { get: () => undefined },
    json: () => Promise.resolve(body ?? {}),
  } as unknown as NextRequest
}

import { getSession } from '@/lib/get-session'
import { GET, PATCH, POST } from './route'
import { NextRequest } from 'next/server'

const authenticatedSession = {
  authenticated: true,
  user: { id: 'user-1', name: 'U', email: 'u@x.com' },
  sessionToken: 'session-token',
}

const unauthSession = { authenticated: false, user: null, sessionToken: null }

describe('GET /api/preferences', () => {
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

  it('calls /preferences/current with Bearer token', async () => {
    ;(getSession as jest.Mock).mockResolvedValue(authenticatedSession)
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: () => Promise.resolve({ language: ['en'] }),
    })
    await GET(createRequest())
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.com/preferences/current',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer session-token' }),
      })
    )
  })

  it('creates preferences on 404 then refetches and returns data', async () => {
    ;(getSession as jest.Mock).mockResolvedValue(authenticatedSession)
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 404 })
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ language: ['en'], id: 'pref-1' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ language: ['en'], id: 'pref-1' }),
      })
    const response = await GET(createRequest())
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data.id).toBe('pref-1')
  })

  it('handles 409 on auto-create by refetching current', async () => {
    ;(getSession as jest.Mock).mockResolvedValue(authenticatedSession)
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 404 })
      .mockResolvedValueOnce({ ok: false, status: 409 })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ language: ['en'], id: 'pref-existing' }),
      })
    const response = await GET(createRequest())
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.data.id).toBe('pref-existing')
  })

  it('returns 200 and data on success', async () => {
    ;(getSession as jest.Mock).mockResolvedValue(authenticatedSession)
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: () => Promise.resolve({ language: ['pt'] }),
    })
    const response = await GET(createRequest())
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data).toEqual({ language: ['pt'] })
  })

  it('normalizes FastAPI detail string error', async () => {
    ;(getSession as jest.Mock).mockResolvedValue(authenticatedSession)
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 422,
      headers: { get: () => 'application/json' },
      json: () => Promise.resolve({ detail: 'Validation error' }),
    })
    const response = await GET(createRequest())
    expect(response.status).toBe(422)
    const data = await response.json()
    expect(data.error).toBe('Validation error')
  })

  it('normalizes FastAPI detail list error', async () => {
    ;(getSession as jest.Mock).mockResolvedValue(authenticatedSession)
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 422,
      headers: { get: () => 'application/json' },
      json: () => Promise.resolve({ detail: [{ msg: 'field required', loc: ['body', 'language'] }] }),
    })
    const response = await GET(createRequest())
    const data = await response.json()
    expect(data.error).toBe('field required')
  })
})

describe('POST /api/preferences', () => {
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
    const response = await POST(createRequest({ language: ['en'] }))
    expect(response.status).toBe(401)
  })

  it('creates preferences and returns 201', async () => {
    ;(getSession as jest.Mock).mockResolvedValue(authenticatedSession)
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 201,
      headers: { get: () => 'application/json' },
      json: () => Promise.resolve({ language: ['en'], id: 'pref-1' }),
    })
    const response = await POST(createRequest({ language: ['en'] }))
    expect(response.status).toBe(201)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data.id).toBe('pref-1')
  })

  it('refetches on 409 conflict and returns existing preferences', async () => {
    ;(getSession as jest.Mock).mockResolvedValue(authenticatedSession)
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 409, headers: { get: () => 'application/json' }, json: () => Promise.resolve({}) })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ language: ['en'], id: 'pref-existing' }),
      })
    const response = await POST(createRequest({}))
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.data.id).toBe('pref-existing')
  })
})

describe('PATCH /api/preferences', () => {
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
    const response = await PATCH(createRequest({ language: ['pt'] }))
    expect(response.status).toBe(401)
  })

  it('calls /preferences/current with PATCH method', async () => {
    ;(getSession as jest.Mock).mockResolvedValue(authenticatedSession)
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: () => Promise.resolve({ language: ['en'] }),
    })
    await PATCH(createRequest({ language: ['en'] }))
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.com/preferences/current',
      expect.objectContaining({ method: 'PATCH' })
    )
  })

  it('returns 200 and updated data on success', async () => {
    ;(getSession as jest.Mock).mockResolvedValue(authenticatedSession)
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: () => Promise.resolve({ language: ['pt'], email_notifications: false }),
    })
    const response = await PATCH(createRequest({ language: ['pt'], email_notifications: false }))
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data.language).toEqual(['pt'])
  })
})
