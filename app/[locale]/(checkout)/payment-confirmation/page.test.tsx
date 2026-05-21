import React from 'react'
import { render, screen } from '@testing-library/react'
import PaymentConfirmationPage from './page'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('@/components/ui/logo', () => ({
  Logo: () => <div data-testid="logo">Logo</div>,
}))

jest.mock('@/i18n/navigation', () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

jest.mock('@/components/auth/protected-route', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

describe('PaymentConfirmationPage', () => {
  it('renders Logo', () => {
    render(<PaymentConfirmationPage />)
    expect(screen.getByTestId('logo')).toBeInTheDocument()
  })

  it('renders title from translations', () => {
    render(<PaymentConfirmationPage />)
    expect(screen.getByText('title')).toBeInTheDocument()
  })

  it('renders message and description from translations', () => {
    render(<PaymentConfirmationPage />)
    expect(screen.getByText('message')).toBeInTheDocument()
    expect(screen.getByText('description')).toBeInTheDocument()
  })

  it('renders goToDashboard button linking to dashboard', () => {
    render(<PaymentConfirmationPage />)
    const link = screen.getByRole('link', { name: 'goToDashboard' })
    expect(link).toHaveAttribute('href', '/dashboard')
  })

  it('has min-h-screen layout in page wrapper', () => {
    const { container } = render(<PaymentConfirmationPage />)
    const wrapper = container.querySelector('.min-h-screen.flex.flex-col')
    expect(wrapper).toBeInTheDocument()
  })
})
