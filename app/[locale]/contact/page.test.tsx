import React from 'react'
import { render, screen } from '@testing-library/react'
import ContactPage from './page'

jest.mock('@/components/layout/header', () => ({
  Header: () => <header data-testid="header">Header</header>,
}))

jest.mock('@/components/layout/footer', () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>,
}))

jest.mock('@/components/features/contact-form', () => ({
  ContactForm: () => <div data-testid="contact-form">ContactForm</div>,
}))

describe('ContactPage', () => {
  it('renders Header and Footer', () => {
    render(<ContactPage />)
    expect(screen.getByTestId('header')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toBeInTheDocument()
  })

  it('renders ContactForm in main', () => {
    render(<ContactPage />)
    expect(screen.getByTestId('contact-form')).toBeInTheDocument()
  })

  it('has min-h-screen and flex layout', () => {
    const { container } = render(<ContactPage />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('min-h-screen', 'flex', 'flex-col')
  })

  it('main has flex-grow and pt-16', () => {
    const { container } = render(<ContactPage />)
    const main = container.querySelector('main')
    expect(main).toHaveClass('flex-grow', 'pt-16')
  })
})
