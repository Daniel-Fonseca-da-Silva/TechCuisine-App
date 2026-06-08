import { renderHook, act, waitFor } from '@testing-library/react'
import { useAuth } from './use-auth'

const mockPush = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

jest.mock('@/lib/auth-config', () => ({
  AUTH_CONFIG: {
    SESSION_CHECK_INTERVAL_MINUTES: 5,
  },
}))

describe('useAuth', () => {
  const originalFetch = global.fetch
  const originalLocalStorage = global.localStorage
  const originalSessionStorage = global.sessionStorage

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    global.fetch = jest.fn()
    Object.defineProperty(global, 'localStorage', {
      value: { clear: jest.fn() },
      writable: true,
    })
    Object.defineProperty(global, 'sessionStorage', {
      value: { clear: jest.fn() },
      writable: true,
    })
  })

  afterEach(() => {
    global.fetch = originalFetch
    Object.defineProperty(global, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
    })
    Object.defineProperty(global, 'sessionStorage', {
      value: originalSessionStorage,
      writable: true,
    })
    jest.useRealTimers()
  })

  it('starts with loading true and unauthenticated', () => {
    global.fetch = jest.fn().mockImplementation(() => new Promise(() => {}))
    const { result } = renderHook(() => useAuth())
    expect(result.current.loading).toBe(true)
    expect(result.current.authenticated).toBe(false)
    expect(result.current.user).toBeNull()
  })

  it('sets authenticated and user when session API returns authenticated', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () =>
        Promise.resolve({
          authenticated: true,
          user: { id: '1', name: 'Test', email: 'test@test.com', image: null },
        }),
    })

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.authenticated).toBe(true)
    expect(result.current.user).toEqual({
      id: '1',
      name: 'Test',
      email: 'test@test.com',
      image: null,
    })
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('redirects to login when session is not authenticated', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ authenticated: false }),
    })

    renderHook(() => useAuth())

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/auth/login?expired=true')
    })
  })

  it('redirects to login with error param when session check throws', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'))

    renderHook(() => useAuth())

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/auth/login?error=session')
    })
  })

  it('login returns success when login API returns success', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({ json: () => Promise.resolve({ authenticated: false }) })
      .mockResolvedValueOnce({ json: () => Promise.resolve({ success: true }) })
      .mockResolvedValueOnce({ json: () => Promise.resolve({ authenticated: false }) })

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    let loginResult: { success: boolean; error?: string }
    await act(async () => {
      loginResult = await result.current.login('testuser', 'Secret123!')
    })

    expect(loginResult!.success).toBe(true)
    expect(global.fetch).toHaveBeenCalledWith('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'testuser', password: 'Secret123!' }),
    })
  })

  it('login returns failure when login API returns success false', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({ json: () => Promise.resolve({ authenticated: false }) })
      .mockResolvedValueOnce({ json: () => Promise.resolve({ success: false, error: 'Invalid credentials' }) })

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    let loginResult: { success: boolean; error?: string }
    await act(async () => {
      loginResult = await result.current.login('baduser', 'wrongpass')
    })

    expect(loginResult!.success).toBe(false)
    expect(loginResult!.error).toBe('Invalid credentials')
  })

  it('logout clears state and redirects to login', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () =>
        Promise.resolve({
          authenticated: true,
          user: { id: '1', name: 'Test', email: 'test@test.com', image: null },
        }),
    })

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.authenticated).toBe(true)
    })

    global.fetch = jest.fn().mockResolvedValue({})

    await act(async () => {
      await result.current.logout()
    })

    expect(result.current.authenticated).toBe(false)
    expect(result.current.user).toBeNull()
    expect(global.localStorage.clear).toHaveBeenCalled()
    expect(global.sessionStorage.clear).toHaveBeenCalled()
    expect(mockPush).toHaveBeenCalledWith('/auth/login')
  })
})
