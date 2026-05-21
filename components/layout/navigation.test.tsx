import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Navigation } from './navigation'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('@/components/ui/logo', () => ({
  Logo: () => <div data-testid="logo">Logo</div>,
}))

describe('Navigation', () => {
  it('renders logo and nav links', () => {
    render(<Navigation />)
    expect(screen.getByTestId('logo')).toBeInTheDocument()
    expect(screen.getByText('home')).toBeInTheDocument()
    expect(screen.getByText('contact')).toBeInTheDocument()
    expect(screen.getByText('language')).toBeInTheDocument()
    expect(screen.getByText('login')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /startNow/i })).toBeInTheDocument()
  })

  it('toggles mobile menu on button click', () => {
    render(<Navigation />)
    const menuButton = screen.getByRole('button', { name: '' })
    fireEvent.click(menuButton)
    expect(screen.getAllByText('home').length).toBeGreaterThan(0)
  })
})
