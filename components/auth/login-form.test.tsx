import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useSearchParams } from 'next/navigation'
import { LoginForm } from './login-form'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
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
    jest.clearAllMocks()
    mockUseSearchParams.mockReturnValue({
      get: jest.fn().mockReturnValue(null),
    })
  })

  it('renders card with title and subtitle', () => {
    render(<LoginForm />)
    expect(screen.getByText('title')).toBeInTheDocument()
    expect(screen.getByText('subtitle')).toBeInTheDocument()
  })

  it('renders username input, password input and submit button', () => {
    render(<LoginForm />)
    expect(screen.getByRole('textbox', { name: /username/i })).toBeInTheDocument()
    expect(screen.getByLabelText('password')).toBeInTheDocument()
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

  it('shows validation error when submitting with too-short username', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)
    await user.type(screen.getByRole('textbox', { name: /username/i }), 'ab')
    await user.type(screen.getByLabelText('password'), 'short')
    fireEvent.click(screen.getByRole('button', { name: /action/i }))

    await waitFor(() => {
      const errorParagraphs = document.querySelectorAll('p.text-red-300')
      expect(errorParagraphs.length).toBeGreaterThan(0)
    })
  })

  it('calls login API and redirects to dashboard on success', async () => {
    const user = userEvent.setup()
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true }),
    })

    render(<LoginForm />)
    await user.type(screen.getByRole('textbox', { name: /username/i }), 'testuser')
    await user.type(screen.getByLabelText('password'), 'Secret123!')
    fireEvent.click(screen.getByRole('button', { name: /action/i }))

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'testuser', password: 'Secret123!' }),
      })
    })

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('shows general error when API returns success false', async () => {
    const user = userEvent.setup()
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: false, code: 'INVALID_CREDENTIALS' }),
    })

    render(<LoginForm />)
    await user.type(screen.getByRole('textbox', { name: /username/i }), 'testuser')
    await user.type(screen.getByLabelText('password'), 'Secret123!')
    fireEvent.click(screen.getByRole('button', { name: /action/i }))

    await waitFor(() => {
      expect(screen.getByText('errorInvalidCredentials')).toBeInTheDocument()
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
    await user.type(screen.getByRole('textbox', { name: /username/i }), 'testuser')
    await user.type(screen.getByLabelText('password'), 'Secret123!')
    const button = screen.getByRole('button', { name: /action/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect(button).toBeDisabled()
    })

    resolvePromise!({ json: () => Promise.resolve({ success: true }) })
  })
})
