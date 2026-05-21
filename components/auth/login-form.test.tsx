import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useSearchParams } from 'next/navigation'
import { LoginForm } from './login-form'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

const mockUseSearchParams = useSearchParams as jest.Mock

describe('LoginForm', () => {
  beforeEach(() => {
    mockUseSearchParams.mockReturnValue({
      get: jest.fn().mockReturnValue(null),
    })
  })

  it('renders card with title and subtitle', () => {
    render(<LoginForm />)
    expect(screen.getByText('title')).toBeInTheDocument()
    expect(screen.getByText('subtitle')).toBeInTheDocument()
  })

  it('renders email input and submit button', () => {
    render(<LoginForm />)
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /action/i })).toBeInTheDocument()
  })

  it('renders link to forgot password', () => {
    render(<LoginForm />)
    const link = screen.getByRole('link', { name: /forgotPassword/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/auth/forgot-password')
  })

  it('renders link to register', () => {
    render(<LoginForm />)
    const link = screen.getByRole('link', { name: /register/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/auth/register')
  })

  it('applies custom className to the card', () => {
    const { container } = render(<LoginForm className="custom-class" />)
    const card = container.querySelector('.custom-class')
    expect(card).toBeInTheDocument()
  })

  it('shows validation error when submitting with invalid email', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)
    const input = screen.getByRole('textbox', { name: /email/i })
    await user.type(input, 'invalid-email')
    const button = screen.getByRole('button', { name: /action/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText(/invalid|email/i)).toBeInTheDocument()
    })
  })

  it('calls magic-link API and shows success when response is success', async () => {
    const user = userEvent.setup()
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true }),
    })

    render(<LoginForm />)
    await user.type(
      screen.getByRole('textbox', { name: /email/i }),
      'user@example.com'
    )
    fireEvent.click(screen.getByRole('button', { name: /action/i }))

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'user@example.com' }),
      })
    })

    await waitFor(() => {
      expect(screen.getByText('emailSent.title')).toBeInTheDocument()
    })
  })

  it('shows general error when API returns success false', async () => {
    const user = userEvent.setup()
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: false, error: 'Rate limit exceeded' }),
    })

    render(<LoginForm />)
    await user.type(
      screen.getByRole('textbox', { name: /email/i }),
      'user@example.com'
    )
    fireEvent.click(screen.getByRole('button', { name: /action/i }))

    await waitFor(() => {
      expect(screen.getByText('Rate limit exceeded')).toBeInTheDocument()
    })
  })

  it('shows session expired alert when searchParams has expired=true', () => {
    mockUseSearchParams.mockReturnValue({
      get: jest.fn((name: string) => (name === 'expired' ? 'true' : null)),
    })
    render(<LoginForm />)
    expect(screen.getByText('sessionExpired.title')).toBeInTheDocument()
  })

  it('shows session error alert when searchParams has error=session', () => {
    mockUseSearchParams.mockReturnValue({
      get: jest.fn((name: string) => (name === 'error' ? 'session' : null)),
    })
    render(<LoginForm />)
    expect(screen.getByText('sessionError.title')).toBeInTheDocument()
  })

  it('disables submit button while loading', async () => {
    const user = userEvent.setup()
    let resolvePromise: (value: unknown) => void
    global.fetch = jest.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve
        })
    )

    render(<LoginForm />)
    await user.type(
      screen.getByRole('textbox', { name: /email/i }),
      'user@example.com'
    )
    const button = screen.getByRole('button', { name: /action/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect(button).toBeDisabled()
    })

    resolvePromise!({ json: () => Promise.resolve({ success: true }) })
  })
})
