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

import { NextRequest } from 'next/server'
import {
  getAdminBackendUrl,
  adminHeaders,
  getAdminSession,
} from './admin-api'
import { getSession } from '@/lib/get-session'

const originalEnv = process.env

beforeEach(() => {
  process.env = { ...originalEnv }
  process.env.BACKEND_API_URL = 'https://api.example.com'
  process.env.BACKEND_STATIC_TOKEN = 'static-token-123'
})

afterEach(() => {
  process.env = originalEnv
  jest.restoreAllMocks()
})

describe('admin-api', () => {
  describe('getAdminBackendUrl', () => {
    it('returns backend URL with /admin prefix and path', () => {
      const url = getAdminBackendUrl('/users')
      expect(url).toMatch(/\/admin\/users$/)
      expect(url).not.toContain('?')
    })

    it('appends search params when provided', () => {
      const params = new URLSearchParams({ page: '1', limit: '10' })
      const url = getAdminBackendUrl('/users', params)
      expect(url).toMatch(/\/admin\/users\?/)
      expect(url).toContain('page=1')
      expect(url).toContain('limit=10')
    })

    it('returns URL without query when searchParams is empty', () => {
      const params = new URLSearchParams()
      const url = getAdminBackendUrl('/users', params)
      expect(url).toMatch(/\/admin\/users$/)
      expect(url).not.toContain('?')
    })

    it('returns URL without query when searchParams is undefined', () => {
      const url = getAdminBackendUrl('/users')
      expect(url).toMatch(/\/admin\/users$/)
      expect(url).not.toContain('?')
    })
  })

  describe('adminHeaders', () => {
    it('returns headers with Content-Type, Authorization, X-User-ID and X-Static-Token', () => {
      const headers = adminHeaders('user-123', 'session-token-abc')
      expect(headers['Content-Type']).toBe('application/json')
      expect(headers['Authorization']).toBe('Bearer session-token-abc')
      expect(headers['X-User-ID']).toBe('user-123')
      expect(headers['X-Static-Token']).toBe('static-token-123')
    })

    it('falls back to BACKEND_APIKEY when BACKEND_STATIC_TOKEN is not set', () => {
      delete process.env.BACKEND_STATIC_TOKEN
      process.env.BACKEND_APIKEY = 'apikey-fallback'
      const headers = adminHeaders('user-1', 'token')
      expect(headers['X-Static-Token']).toBe('apikey-fallback')
    })

    it('uses empty string for X-Static-Token when neither BACKEND_STATIC_TOKEN nor BACKEND_APIKEY is set', () => {
      delete process.env.BACKEND_STATIC_TOKEN
      delete process.env.BACKEND_APIKEY
      const headers = adminHeaders('user-1', 'token')
      expect(headers['X-Static-Token']).toBe('')
    })
  })

  describe('getAdminSession', () => {
    it('returns 401 when session API says not authenticated', async () => {
      (getSession as jest.Mock).mockResolvedValue({ authenticated: false, user: null })

      const request = {} as NextRequest

      const result = await getAdminSession(request)
      expect(result).toHaveProperty('status', 401)
      const body = await (result as { json: () => Promise<{ error: string }> }).json()
      expect(body.error).toBe('Not authenticated')
    })

    it('returns 401 when session has no user id', async () => {
      (getSession as jest.Mock).mockResolvedValue({ authenticated: false, user: null })

      const request = {} as NextRequest

      const result = await getAdminSession(request)
      expect(result).toHaveProperty('status', 401)
    })

    it('returns 401 when session cookie is missing', async () => {
      (getSession as jest.Mock).mockResolvedValue({ authenticated: false, user: null })

      const request = {} as NextRequest

      const result = await getAdminSession(request)
      expect(result).toHaveProperty('status', 401)
    })

    it('returns userId and sessionToken when authenticated and cookie present', async () => {
      (getSession as jest.Mock).mockResolvedValue({
        authenticated: true,
        user: { id: 'user-456', name: 'User', email: 'u@x.com', image: null },
        sessionToken: 'session-token-xyz',
      })

      const request = {} as NextRequest

      const result = await getAdminSession(request)
      expect(result).toHaveProperty('userId')
      expect(result).toHaveProperty('sessionToken')
      expect(result).toEqual({
        userId: 'user-456',
        sessionToken: 'session-token-xyz',
      })
    })
  })
})
