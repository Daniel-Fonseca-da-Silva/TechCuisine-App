jest.mock('next/server', () => ({
  NextRequest: function () {},
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: () => Promise.resolve(body),
      cookies: { delete: jest.fn() },
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
    nextUrl: { origin: 'https://app.example.com' },
    headers: { get: () => null },
    cookies: { get: () => undefined },
    json: () => Promise.resolve(body ?? {}),
  } as unknown as NextRequest
}

import { getSession } from '@/lib/get-session'
import { DELETE, GET, PATCH, POST } from './route'
import { NextRequest } from 'next/server'

const authenticatedSession = {
  authenticated: true,
  user: { id: 'user-1', name: 'U', email: 'u@x.com' },
  sessionToken: 'session-token',
}

const unauthSession = { authenticated: false, user: null, sessionToken: null }

describe('GET /api/configuration', () => {
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

  it('calls /configurations/current with Bearer token', async () => {
    ;(getSession as jest.Mock).mockResolvedValue(authenticatedSession)
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: () => Promise.resolve({ full_name: 'Jane' }),
    })
    await GET(createRequest())
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.com/configurations/current',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer session-token' }),
      })
    )
  })

  it('returns 200 with data: null when backend returns 404', async () => {
    ;(getSession as jest.Mock).mockResolvedValue(authenticatedSession)
    global.fetch = jest.fn().mockResolvedValueOnce({ ok: false, status: 404 })
    const response = await GET(createRequest())
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data).toBeNull()
  })

  it('returns 200 and data on success', async () => {
    ;(getSession as jest.Mock).mockResolvedValue(authenticatedSession)
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: () => Promise.resolve({ full_name: 'Jane' }),
    })
    const response = await GET(createRequest())
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data).toEqual({ full_name: 'Jane' })
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
      json: () => Promise.resolve({ detail: [{ msg: 'field required', loc: ['body', 'gender'] }] }),
    })
    const response = await GET(createRequest())
    const data = await response.json()
    expect(data.error).toBe('field required')
  })
})

describe('POST /api/configuration', () => {
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
    const response = await POST(createRequest({ full_name: 'Jane' }))
    expect(response.status).toBe(401)
  })

  it('creates configuration and returns 201', async () => {
    ;(getSession as jest.Mock).mockResolvedValue(authenticatedSession)
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 201,
      headers: { get: () => 'application/json' },
      json: () => Promise.resolve({ full_name: 'Jane', id: 'cfg-1' }),
    })
    const response = await POST(createRequest({ full_name: 'Jane' }))
    expect(response.status).toBe(201)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data.id).toBe('cfg-1')
  })

  it('refetches on 409 conflict and returns existing config', async () => {
    ;(getSession as jest.Mock).mockResolvedValue(authenticatedSession)
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 409, headers: { get: () => 'application/json' }, json: () => Promise.resolve({}) })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ full_name: 'Existing', id: 'cfg-existing' }),
      })
    const response = await POST(createRequest({}))
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.data.id).toBe('cfg-existing')
  })
})

describe('DELETE /api/configuration', () => {
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
    const response = await DELETE(createRequest())
    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.success).toBe(false)
  })

  it('returns 401 when not authenticated', async () => {
    ;(getSession as jest.Mock).mockResolvedValue(unauthSession)
    const response = await DELETE(createRequest())
    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.error).toBe('Not authenticated')
  })

  it('calls /configurations/current with DELETE method and Bearer token', async () => {
    ;(getSession as jest.Mock).mockResolvedValue(authenticatedSession)
    global.fetch = jest.fn().mockResolvedValueOnce({ ok: true, status: 204, headers: { get: () => null } })
    await DELETE(createRequest())
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.com/configurations/current',
      expect.objectContaining({
        method: 'DELETE',
        headers: expect.objectContaining({ Authorization: 'Bearer session-token' }),
      })
    )
  })

  it('returns success and clears cookies on 204', async () => {
    ;(getSession as jest.Mock).mockResolvedValue(authenticatedSession)
    global.fetch = jest.fn().mockResolvedValueOnce({ ok: true, status: 204, headers: { get: () => null } })
    const response = await DELETE(createRequest())
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(response.cookies.delete).toHaveBeenCalledTimes(2)
  })

  it('returns error status on backend failure', async () => {
    ;(getSession as jest.Mock).mockResolvedValue(authenticatedSession)
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 403,
      headers: { get: () => 'application/json' },
      json: () => Promise.resolve({ detail: 'Forbidden' }),
    })
    const response = await DELETE(createRequest())
    expect(response.status).toBe(403)
    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.error).toBe('Forbidden')
  })
})

describe('PATCH /api/configuration', () => {
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
    const response = await PATCH(createRequest({ full_name: 'Jane' }))
    expect(response.status).toBe(401)
  })

  it('calls /configurations/current with PATCH method', async () => {
    ;(getSession as jest.Mock).mockResolvedValue(authenticatedSession)
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: () => Promise.resolve({ full_name: 'Jane' }),
    })
    await PATCH(createRequest({ full_name: 'Jane' }))
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.com/configurations/current',
      expect.objectContaining({ method: 'PATCH' })
    )
  })

  it('returns 200 and updated data on success', async () => {
    ;(getSession as jest.Mock).mockResolvedValue(authenticatedSession)
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: () => Promise.resolve({ full_name: 'Updated' }),
    })
    const response = await PATCH(createRequest({ full_name: 'Updated' }))
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data.full_name).toBe('Updated')
  })
})
