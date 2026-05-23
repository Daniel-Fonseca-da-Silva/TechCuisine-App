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

import type { NextRequest } from 'next/server'
import { getSession } from '@/lib/get-session'
import { handleGenerateAIRequest } from './api-helpers'

const authenticatedSession = {
  authenticated: true as const,
  user: { id: 'u1', name: 'User', email: 'u@example.com', image: null },
  sessionToken: 'session-123',
}

const unauthSession = { authenticated: false as const, user: null }

const defaultOptions = {
  endpoint: '/generate',
  errorMessage: 'Generation failed',
  successMessage: 'Generated',
  logContext: 'Test',
}

function createRequest(body: object) {
  return {
    json: () => Promise.resolve(body),
  } as NextRequest
}

describe('api-helpers', () => {
  const originalFetch = global.fetch
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
    process.env.BACKEND_API_URL = 'https://api.example.com'
    ;(getSession as jest.Mock).mockResolvedValue(authenticatedSession)
  })

  afterEach(() => {
    process.env = originalEnv
    global.fetch = originalFetch
    jest.restoreAllMocks()
  })

  describe('handleGenerateAIRequest', () => {
    it('returns 400 when content is missing', async () => {
      const request = createRequest({})
      const response = await handleGenerateAIRequest(request, defaultOptions)
      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toBe('Content is required')
    })

    it('returns 400 when content is empty string', async () => {
      const request = createRequest({ content: '' })
      const response = await handleGenerateAIRequest(request, defaultOptions)
      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Content is required')
    })

    it('returns 400 when content is only whitespace', async () => {
      const request = createRequest({ content: '   ' })
      const response = await handleGenerateAIRequest(request, defaultOptions)
      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Content is required')
    })

    it('returns 401 when session token is missing', async () => {
      ;(getSession as jest.Mock).mockResolvedValue(unauthSession)
      const request = createRequest({ content: 'Hello' })
      const response = await handleGenerateAIRequest(request, defaultOptions)
      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toBe('User not authenticated')
    })

    it('returns 200 and success when backend succeeds', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ result: 'generated-data' }),
      })

      const request = createRequest({ content: 'Hello world' })
      const response = await handleGenerateAIRequest(request, defaultOptions)
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data).toEqual({ result: 'generated-data' })
      expect(data.message).toBe('Generated')
      const [fetchUrl, fetchOptions] = (global.fetch as jest.Mock).mock.calls[0]
      expect(fetchUrl).toMatch(/\/generate$/)
      expect(fetchOptions).toMatchObject({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer session-123',
        },
        body: JSON.stringify({ content: 'Hello world' }),
      })
    })

    it('trims content before sending to backend', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      })

      const request = createRequest({ content: '  trimmed  ' })
      await handleGenerateAIRequest(request, defaultOptions)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({ content: 'trimmed' }),
        })
      )
    })

    it('returns backend status and error message when backend fails', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 422,
        json: () => Promise.resolve({ message: 'Invalid input' }),
      })

      const request = createRequest({ content: 'Bad' })
      const response = await handleGenerateAIRequest(request, defaultOptions)
      expect(response.status).toBe(422)
      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toBe('Invalid input')
    })

    it('uses options.errorMessage when backend response has no message', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({}),
      })

      const request = createRequest({ content: 'x' })
      const response = await handleGenerateAIRequest(request, defaultOptions)
      const data = await response.json()
      expect(data.error).toBe('Generation failed')
    })

    it('returns 500 and generic error when request throws', async () => {
      const request = createRequest({ content: 'x' })
      request.json = () => Promise.reject(new Error('Network error'))
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const response = await handleGenerateAIRequest(request, defaultOptions)
      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toBe('Internal server error')
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })
})
