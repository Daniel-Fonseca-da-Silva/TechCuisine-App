import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Footer } from './footer'

jest.mock('next-intl', () => ({
  useTranslations: (ns: string) => (key: string) => (ns ? `${ns}.${key}` : key),
}))

jest.mock('@/i18n/navigation', () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

jest.mock('@/components/ui/logo', () => ({
  Logo: () => <div data-testid="logo">Logo</div>,
}))

jest.mock('@/components/cookie/cookie-settings-modal', () => ({
  CookieSettingsModal: ({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) =>
    open ? <div data-testid="cookie-modal"><button type="button" onClick={() => onOpenChange(false)}>Close</button></div> : null,
}))

describe('Footer', () => {
  it('renders description and sections', () => {
    render(<Footer />)
    expect(screen.getByText('HomePage.footer.description')).toBeInTheDocument()
    expect(screen.getByText('HomePage.footer.company')).toBeInTheDocument()
    expect(screen.getByText('HomePage.footer.legal')).toBeInTheDocument()
    expect(screen.getByText('HomePage.footer.information')).toBeInTheDocument()
  })

  it('renders cookie settings button and opens modal on click', () => {
    render(<Footer />)
    expect(screen.getByText('HomePage.footer.cookies')).toBeInTheDocument()
    fireEvent.click(screen.getByText('HomePage.footer.cookies'))
    expect(screen.getByTestId('cookie-modal')).toBeInTheDocument()
  })

  it('renders privacy and terms links', () => {
    render(<Footer />)
    expect(screen.getByRole('link', { name: 'HomePage.footer.privacy' })).toHaveAttribute('href', '/privacy-policy')
    expect(screen.getByRole('link', { name: 'HomePage.footer.terms' })).toHaveAttribute('href', '/terms-of-use')
  })

  it('renders compare tools link', () => {
    render(<Footer />)
    expect(screen.getByRole('link', { name: 'HomePage.footer.compareTools' })).toHaveAttribute('href', '/compare')
  })

  it('renders about link', () => {
    render(<Footer />)
    expect(screen.getByRole('link', { name: 'HomePage.footer.about' })).toHaveAttribute('href', '/about')
  })

  it('renders social links for Instagram and LinkedIn', () => {
    render(<Footer />)

    const instagramLink = screen.getByRole('link', { name: 'Tech Cuisine Instagram' })
    expect(instagramLink).toHaveAttribute('href', 'https://instagram.com/techcuisine')

    const linkedinLink = screen.getByRole('link', { name: 'Tech Cuisine LinkedIn' })
    expect(linkedinLink).toHaveAttribute('href', 'https://www.linkedin.com/company/techcuisine')
  })
})
