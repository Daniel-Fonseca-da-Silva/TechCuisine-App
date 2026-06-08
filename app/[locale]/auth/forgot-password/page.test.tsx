import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ForgotPasswordPage from './page'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('@/components/layout/header', () => ({
  Header: () => <header data-testid="header">Header</header>,
}))

jest.mock('@/components/layout/footer', () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>,
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
  })

  it('renders Header and Footer', () => {
    render(<ForgotPasswordPage />)
    expect(screen.getByTestId('header')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toBeInTheDocument()
  })

  it('renders card with title and subtitle from translations', () => {
    render(<ForgotPasswordPage />)
    expect(screen.getByText('title')).toBeInTheDocument()
    expect(screen.getByText('subtitle')).toBeInTheDocument()
  })

  it('renders email input and submit button', () => {
    render(<ForgotPasswordPage />)
    expect(screen.getByRole('textbox', { name: /subtitle2/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'action' })).toBeInTheDocument()
  })

  it('renders link back to login', () => {
    render(<ForgotPasswordPage />)
    const link = screen.getByRole('link', { name: 'backToLogin' })
    expect(link).toHaveAttribute('href', '/auth/login')
  })

  it('shows success alert when API returns success: true', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, message: 'Magic link sent' }),
    })
    const user = userEvent.setup()
    render(<ForgotPasswordPage />)
    const input = screen.getByRole('textbox', { name: /subtitle2/i })
    await user.type(input, 'valid@example.com')
    const submit = screen.getByRole('button', { name: 'action' })
    fireEvent.click(submit)

    await waitFor(() => {
      expect(screen.getByText('codeSent.title')).toBeInTheDocument()
      expect(screen.getByText('codeSent.message')).toBeInTheDocument()
    })
    expect(global.fetch).toHaveBeenCalledWith('/api/auth/forgot-password', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ email: 'valid@example.com' }),
    }))
  })

  it('shows error when API returns success: false', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: false, error: 'User not found' }),
    })
    const user = userEvent.setup()
    render(<ForgotPasswordPage />)
    const input = screen.getByRole('textbox', { name: /subtitle2/i })
    await user.type(input, 'valid@example.com')
    const submit = screen.getByRole('button', { name: 'action' })
    fireEvent.click(submit)

    await waitFor(() => {
      expect(screen.getByText('User not found')).toBeInTheDocument()
    })
  })
})
