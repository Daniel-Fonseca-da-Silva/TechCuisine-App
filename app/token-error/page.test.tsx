import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import TokenErrorPage from './page'

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(),
}))

describe('TokenErrorPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders default expired content after mount', async () => {
    render(<TokenErrorPage />)
    await screen.findByText('Token Expired')
    expect(screen.getByText('Your authentication link has expired')).toBeInTheDocument()
    expect(screen.getByText('Get New Link')).toBeInTheDocument()
    expect(screen.getByText('Go Home')).toBeInTheDocument()
  })

  it('calls router.push to home when Go Home is clicked', async () => {
    render(<TokenErrorPage />)
    await screen.findByText('Go Home')
    fireEvent.click(screen.getByText('Go Home'))
    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('calls router.push to login with expired param when Get New Link is clicked', async () => {
    render(<TokenErrorPage />)
    await screen.findByText('Get New Link')
    fireEvent.click(screen.getByText('Get New Link'))
    expect(mockPush).toHaveBeenCalledWith('/auth/login?expired=true')
  })
})
