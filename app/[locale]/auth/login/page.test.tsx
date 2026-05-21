import React from 'react'
import { render, screen } from '@testing-library/react'
import LoginPage from './page'

jest.mock('@/components/layout/header', () => ({
  Header: () => <header data-testid="header">Header</header>,
}))

jest.mock('@/components/layout/footer', () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>,
}))

jest.mock('@/components/auth/login-form', () => ({
  LoginForm: () => <div data-testid="login-form">LoginForm</div>,
}))

describe('LoginPage', () => {
  it('renders Header and Footer', () => {
    render(<LoginPage />)
    expect(screen.getByTestId('header')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toBeInTheDocument()
  })

  it('renders LoginForm in main', () => {
    render(<LoginPage />)
    expect(screen.getByTestId('login-form')).toBeInTheDocument()
  })

  it('has min-h-screen wrapper', () => {
    const { container } = render(<LoginPage />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('min-h-screen')
  })

  it('main has relative flex and centering classes', () => {
    const { container } = render(<LoginPage />)
    const main = container.querySelector('main')
    expect(main).toHaveClass('relative', 'flex', 'items-center', 'justify-center')
  })
})
