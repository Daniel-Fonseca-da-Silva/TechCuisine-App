import React from 'react'
import { render, screen } from '@testing-library/react'
import RegisterPage from './page'

jest.mock('@/components/layout/header', () => ({
  Header: () => <header data-testid="header">Header</header>,
}))

jest.mock('@/components/layout/footer', () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>,
}))

jest.mock('@/components/auth/register-form', () => ({
  RegisterForm: () => <div data-testid="register-form">RegisterForm</div>,
}))

describe('RegisterPage', () => {
  it('renders Header and Footer', () => {
    render(<RegisterPage />)
    expect(screen.getByTestId('header')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toBeInTheDocument()
  })

  it('renders RegisterForm in main', () => {
    render(<RegisterPage />)
    expect(screen.getByTestId('register-form')).toBeInTheDocument()
  })

  it('has min-h-screen wrapper', () => {
    const { container } = render(<RegisterPage />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('min-h-screen')
  })

  it('main has relative flex and centering classes', () => {
    const { container } = render(<RegisterPage />)
    const main = container.querySelector('main')
    expect(main).toHaveClass('relative', 'flex', 'items-center', 'justify-center')
  })
})
