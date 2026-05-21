import React from 'react'
import { render, screen } from '@testing-library/react'
import TermsOfUsePage from './page'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('@/components/layout/header', () => ({
  Header: () => <header data-testid="header">Header</header>,
}))

jest.mock('@/components/layout/footer', () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>,
}))

describe('TermsOfUsePage', () => {
  it('renders Header and Footer', () => {
    render(<TermsOfUsePage />)
    expect(screen.getByTestId('header')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toBeInTheDocument()
  })

  it('renders page title from translations', () => {
    render(<TermsOfUsePage />)
    expect(screen.getByText('title')).toBeInTheDocument()
  })

  it('renders effective date and last update labels', () => {
    render(<TermsOfUsePage />)
    expect(screen.getAllByText(/effectiveDate/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/lastUpdate/).length).toBeGreaterThan(0)
  })

  it('renders section1 title', () => {
    render(<TermsOfUsePage />)
    expect(screen.getByText('section1.title')).toBeInTheDocument()
  })

  it('has min-h-screen wrapper', () => {
    const { container } = render(<TermsOfUsePage />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('min-h-screen')
  })

  it('renders main content with multiple sections', () => {
    render(<TermsOfUsePage />)
    expect(screen.getByText('section2.title')).toBeInTheDocument()
    expect(screen.getByText('section3.title')).toBeInTheDocument()
  })
})
