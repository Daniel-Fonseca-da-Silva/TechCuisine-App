import React from 'react'
import { render, renderHook } from '@testing-library/react'
import {
  TokenErrorHandler,
  useTokenErrorHandler,
} from './token-error-handler'

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

describe('TokenErrorHandler', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = originalFetch
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('renders nothing', () => {
    const { container } = render(
      <TokenErrorHandler errorType="expired" />
    )
    expect(container.firstChild).toBeNull()
  })

  it('calls onError when API response has expired error and onError is provided', async () => {
    const onError = jest.fn()
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({ error: 'Token expired' }),
    })

    render(<TokenErrorHandler errorType="expired" onError={onError} />)

    await global.fetch('/test')
    await new Promise((r) => setTimeout(r, 0))

    expect(onError).toHaveBeenCalledWith('expired')
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('redirects to token-error when API response has expired error and no onError', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({ error: 'Token expired' }),
    })

    render(<TokenErrorHandler errorType="expired" />)
    await global.fetch('/test')
    await new Promise((r) => setTimeout(r, 0))

    expect(mockPush).toHaveBeenCalledWith('/token-error?type=expired')
  })

  it('restores fetch on unmount', () => {
    const customFetch = jest.fn()
    global.fetch = customFetch
    const { unmount } = render(<TokenErrorHandler errorType="expired" />)
    unmount()
    expect(global.fetch).toBe(customFetch)
  })
})

describe('useTokenErrorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('handleTokenError pushes to token-error with type param', () => {
    const { result } = renderHook(() => useTokenErrorHandler())
    result.current.handleTokenError('invalid')
    expect(mockPush).toHaveBeenCalledWith('/token-error?type=invalid')
  })

  it('handleTokenError includes email in query when provided', () => {
    const { result } = renderHook(() => useTokenErrorHandler())
    result.current.handleTokenError('email_mismatch', 'user@example.com')
    expect(mockPush).toHaveBeenCalledWith(
      '/token-error?type=email_mismatch&email=user%40example.com'
    )
  })

  it('handleApiError redirects for expired message', () => {
    const { result } = renderHook(() => useTokenErrorHandler())
    result.current.handleApiError(new Error('Token expired'))
    expect(mockPush).toHaveBeenCalledWith('/token-error?type=expired')
  })

  it('handleApiError redirects for invalid token message', () => {
    const { result } = renderHook(() => useTokenErrorHandler())
    result.current.handleApiError(new Error('Invalid token'))
    expect(mockPush).toHaveBeenCalledWith('/token-error?type=invalid')
  })

  it('handleApiError redirects for server_error by default', () => {
    const { result } = renderHook(() => useTokenErrorHandler())
    result.current.handleApiError(new Error('Something else'))
    expect(mockPush).toHaveBeenCalledWith('/token-error?type=server_error')
  })

  it('handleApiError passes email when provided', () => {
    const { result } = renderHook(() => useTokenErrorHandler())
    result.current.handleApiError(new Error('Token expired'), 'user@example.com')
    expect(mockPush).toHaveBeenCalledWith(
      '/token-error?type=expired&email=user%40example.com'
    )
  })
})
