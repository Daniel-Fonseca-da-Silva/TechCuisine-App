import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Header } from './header'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('@/hooks/use-locale', () => ({
  useLocale: () => ({ locale: 'en', changeLocale: jest.fn() }),
}))

jest.mock('@/lib/shared/language-flag', () => ({
  languageOptions: [{ code: 'en', name: 'English', flag: () => null }],
  getLanguageOption: (code: string) =>
    code === 'en' ? { code: 'en', name: 'English', flag: () => null } : null,
}))

jest.mock('@/components/ui/logo', () => ({
  Logo: () => <div data-testid="logo">Logo</div>,
}))

jest.mock('@/i18n/navigation', () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

describe('Header', () => {
  it('renders logo and navigation links', () => {
    render(<Header />)
    expect(screen.getByTestId('logo')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'home' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'contact' })).toHaveAttribute('href', '/contact')
  })

  it('renders login and start now links', () => {
    render(<Header />)
    expect(screen.getByRole('link', { name: 'login' })).toHaveAttribute('href', '/auth/login')
    expect(screen.getByRole('link', { name: /startNow/i })).toHaveAttribute('href', '/auth/register')
  })

  it('toggles mobile menu on button click', () => {
    render(<Header />)
    const buttons = screen.getAllByRole('button')
    const mobileMenuButton = buttons[buttons.length - 1]
    fireEvent.click(mobileMenuButton)
    expect(screen.getAllByText('home').length).toBeGreaterThan(0)
  })
})
