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

import { NextRequest } from 'next/server'
import { POST } from './route'

const validBody = {
  username: 'janedoe',
  email: 'jane@example.com',
  password: 'secret123',
}

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    process.env = { ...originalEnv }
    process.env.BACKEND_API_URL = 'https://api.example.com'
  })
  afterEach(() => {
    process.env = originalEnv
    global.fetch = originalFetch
  })

  it('returns 400 when validation fails', async () => {
    const request = createRequest({ username: 'ab', email: 'x@y.com', password: 'short' })
    const response = await POST(request)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.success).toBe(false)
  })

  it('returns 409 when backend reports conflict', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 409,
      json: () => Promise.resolve({ detail: 'Email taken' }),
    })
    const request = createRequest(validBody)
    const response = await POST(request)
    expect(response.status).toBe(409)
    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.error).toContain('Email taken')
  })

  it('returns 200 when backend creates user', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 'user-1' }),
    })
    const request = createRequest(validBody)
    const response = await POST(request)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.com/auth/register_user',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          username: validBody.username,
          email: validBody.email,
          password: validBody.password,
        }),
      })
    )
  })
})
