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

function createRequest(cookie?: string, sessionToken?: string, formData?: FormData) {
  return {
    nextUrl: { origin: 'https://app.example.com' },
    headers: { get: () => cookie ?? null },
    cookies: { get: () => (sessionToken ? { value: sessionToken } : undefined) },
    formData: () => Promise.resolve(formData ?? new FormData()),
  } as unknown as NextRequest
}

import { getSession } from '@/lib/get-session'
import { POST } from './route'
import { NextRequest } from 'next/server'

describe('POST /api/upload/profile', () => {
  beforeEach(() => {
    process.env = { ...originalEnv }
    process.env.BACKEND_API_URL = 'https://api.example.com'
    jest.clearAllMocks()
  })
  afterEach(() => {
    process.env = originalEnv
    global.fetch = originalFetch
  })

  it('returns 401 when not authenticated', async () => {
    (getSession as jest.Mock).mockResolvedValue({ authenticated: false, user: null, sessionToken: null })
    const request = createRequest('cookie', undefined)
    const response = await POST(request)
    expect(response.status).toBe(401)
  })

  it('returns 400 when file is missing', async () => {
    (getSession as jest.Mock).mockResolvedValue({ authenticated: true, user: { id: 'u1' }, sessionToken: 'token' })
    const request = createRequest('cookie', 'token', new FormData())
    const response = await POST(request)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toMatch(/file/)
  })

  it('returns 200 and url when backend succeeds', async () => {
    (getSession as jest.Mock).mockResolvedValue({ authenticated: true, user: { id: 'u1' }, sessionToken: 'token' })
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      text: () =>
        Promise.resolve(JSON.stringify({ avatar_picture: 'https://cdn.example.com/avatar.jpg' })),
    })
    const formData = new FormData()
    formData.append('file', new File(['x'], 'avatar.jpg'))
    const request = createRequest('cookie', 'token', formData)
    const response = await POST(request)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.url).toBe('https://cdn.example.com/avatar.jpg')
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.com/configurations/current/avatar',
      expect.objectContaining({
        method: 'POST',
        headers: { Authorization: 'Bearer token' },
      })
    )
  })
})
