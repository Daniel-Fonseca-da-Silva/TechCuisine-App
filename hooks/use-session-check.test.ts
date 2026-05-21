import { renderHook, act } from '@testing-library/react'
import { useSessionCheck } from './use-session-check'

const mockPush = jest.fn()
const mockCheckSession = jest.fn()

let mockAuthenticated = true

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/dashboard',
}))

jest.mock('./use-auth', () => ({
  useAuth: () => ({
    authenticated: mockAuthenticated,
    checkSession: mockCheckSession,
  }),
}))

describe('useSessionCheck', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockAuthenticated = true
  })

  it('calls checkSession on mount', () => {
    renderHook(() => useSessionCheck())
    expect(mockCheckSession).toHaveBeenCalled()
  })

  it('does not redirect when authenticated is true', () => {
    renderHook(() => useSessionCheck())
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('redirects to login when authenticated is false', () => {
    mockAuthenticated = false
    renderHook(() => useSessionCheck())
    act(() => {})
    expect(mockPush).toHaveBeenCalledWith('/auth/login')
  })
})
