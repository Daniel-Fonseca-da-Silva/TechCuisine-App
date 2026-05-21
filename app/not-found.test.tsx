import React from 'react'
import { render, screen } from '@testing-library/react'
import NotFound from './not-found'

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

describe('NotFound', () => {
  it('renders 404 title and description after mount', () => {
    render(<NotFound />)
    expect(screen.getByText('Page Not Found')).toBeInTheDocument()
    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.getByText(/Oops!/)).toBeInTheDocument()
    expect(screen.getByText(/The page you're looking for/)).toBeInTheDocument()
  })

  it('renders Go Home link to root', () => {
    render(<NotFound />)
    const link = screen.getByRole('link', { name: /Go Home/i })
    expect(link).toHaveAttribute('href', '/')
  })
})
