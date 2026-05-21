import React from 'react'
import { render, screen } from '@testing-library/react'
import { HeroSection } from './hero-section'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('@/i18n/navigation', () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

describe('HeroSection', () => {
  it('renders badge and headline', () => {
    render(<HeroSection />)
    expect(screen.getByText('badge')).toBeInTheDocument()
    expect(screen.getByText('subheadline')).toBeInTheDocument()
  })

  it('renders primary CTA link to register', () => {
    render(<HeroSection />)
    const link = screen.getByRole('link', { name: /ctaPrimary/i })
    expect(link).toHaveAttribute('href', '/auth/register')
  })

  it('renders secondary CTA button', () => {
    render(<HeroSection />)
    expect(screen.getByRole('button', { name: /ctaSecondary/i })).toBeInTheDocument()
  })
})
