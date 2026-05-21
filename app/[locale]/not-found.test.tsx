import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import NotFound from './not-found'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('@/components/layout/header', () => ({
  Header: () => <header data-testid="header">Header</header>,
}))

jest.mock('@/components/layout/footer', () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>,
}))

const mockBack = jest.fn()
const mockPush = jest.fn()
jest.mock('@/i18n/navigation', () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
  useRouter: () => ({ back: mockBack, push: mockPush }),
}))

describe('NotFound (locale)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    Object.defineProperty(window, 'history', {
      value: { length: 2 },
      writable: true,
    })
  })

  it('renders error code from translations', () => {
    render(<NotFound />)
    expect(screen.getByText('errorCode')).toBeInTheDocument()
  })

  it('renders title and subtitle from translations', () => {
    render(<NotFound />)
    expect(screen.getByText('title')).toBeInTheDocument()
    expect(screen.getByText('subtitle')).toBeInTheDocument()
  })

  it('renders description from translations', () => {
    render(<NotFound />)
    expect(screen.getByText('description')).toBeInTheDocument()
  })

  it('renders Header and Footer', () => {
    render(<NotFound />)
    expect(screen.getByTestId('header')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toBeInTheDocument()
  })

  it('renders goBack button that calls router.back when history has entries', () => {
    render(<NotFound />)
    const goBackButton = screen.getByRole('button', { name: 'goBack' })
    fireEvent.click(goBackButton)
    expect(mockBack).toHaveBeenCalled()
  })

  it('renders goHome link to root', () => {
    render(<NotFound />)
    const link = screen.getByRole('link', { name: 'goHome' })
    expect(link).toHaveAttribute('href', '/')
  })

  it('calls router.push("/") when goBack is clicked and history length is 1', () => {
    Object.defineProperty(window, 'history', {
      value: { length: 1 },
      writable: true,
    })
    render(<NotFound />)
    const goBackButton = screen.getByRole('button', { name: 'goBack' })
    fireEvent.click(goBackButton)
    expect(mockPush).toHaveBeenCalledWith('/')
  })
})
