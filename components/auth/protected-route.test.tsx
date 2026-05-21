import React from 'react'
import { render, screen } from '@testing-library/react'
import { ProtectedRoute } from './protected-route'

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

const mockUseAuth = jest.fn()
jest.mock('@/hooks/use-auth', () => ({
  useAuth: () => mockUseAuth(),
}))

jest.mock('@/hooks/use-session-check', () => ({
  useSessionCheck: () => {},
}))

describe('ProtectedRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading spinner when loading is true', () => {
    mockUseAuth.mockReturnValue({ loading: true, authenticated: false })
    const { container } = render(
      <ProtectedRoute>
        <span>Protected content</span>
      </ProtectedRoute>
    )
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
  })

  it('renders children when authenticated', () => {
    mockUseAuth.mockReturnValue({ loading: false, authenticated: true })
    render(
      <ProtectedRoute>
        <span>Protected content</span>
      </ProtectedRoute>
    )
    expect(screen.getByText('Protected content')).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('renders default fallback and redirects when not authenticated', () => {
    mockUseAuth.mockReturnValue({ loading: false, authenticated: false })
    render(
      <ProtectedRoute>
        <span>Protected content</span>
      </ProtectedRoute>
    )
    expect(screen.getByText('Redirecting to login...')).toBeInTheDocument()
    expect(screen.getByText('You need to be logged in to access this page.')).toBeInTheDocument()
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
    expect(mockPush).toHaveBeenCalledWith('/auth/login')
  })

  it('renders custom fallback when not authenticated and fallback is provided', () => {
    mockUseAuth.mockReturnValue({ loading: false, authenticated: false })
    render(
      <ProtectedRoute fallback={<div>Custom fallback</div>}>
        <span>Protected content</span>
      </ProtectedRoute>
    )
    expect(screen.getByText('Custom fallback')).toBeInTheDocument()
    expect(screen.queryByText('Redirecting to login...')).not.toBeInTheDocument()
    expect(mockPush).toHaveBeenCalledWith('/auth/login')
  })

  it('does not redirect while still loading', () => {
    mockUseAuth.mockReturnValue({ loading: true, authenticated: false })
    render(
      <ProtectedRoute>
        <span>Protected content</span>
      </ProtectedRoute>
    )
    expect(mockPush).not.toHaveBeenCalled()
  })
})
