import React from 'react'
import { render, screen } from '@testing-library/react'
import PrivacyPolicyPage from './page'

jest.mock('next-intl/server', () => ({
  getTranslations: jest.fn(async () => (key: string) => key),
  getLocale: jest.fn(async () => 'en'),
}))

jest.mock('@/lib/seo', () => ({
  buildAlternates: () => ({ canonical: 'https://example.com', languages: {} }),
  buildOgImage: () => [{ url: 'https://example.com/og.png', width: 1200, height: 630 }],
}))

jest.mock('@/components/layout/header', () => ({
  Header: () => <header data-testid="header">Header</header>,
}))

jest.mock('@/components/layout/footer', () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>,
}))

describe('PrivacyPolicyPage', () => {
  it('renders Header and Footer', async () => {
    render(await PrivacyPolicyPage())
    expect(screen.getByTestId('header')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toBeInTheDocument()
  })

  it('renders page title from translations', async () => {
    render(await PrivacyPolicyPage())
    expect(screen.getByText('title')).toBeInTheDocument()
  })

  it('renders effective date and last update labels', async () => {
    render(await PrivacyPolicyPage())
    expect(screen.getAllByText(/effectiveDate/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/lastUpdate/).length).toBeGreaterThan(0)
  })

  it('renders section1 title', async () => {
    render(await PrivacyPolicyPage())
    expect(screen.getByText('section1.title')).toBeInTheDocument()
  })

  it('has min-h-screen wrapper', async () => {
    const { container } = render(await PrivacyPolicyPage())
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('min-h-screen')
  })

  it('renders main content with multiple sections', async () => {
    render(await PrivacyPolicyPage())
    expect(screen.getByText('section2.title')).toBeInTheDocument()
    expect(screen.getByText('section3.title')).toBeInTheDocument()
  })
})
