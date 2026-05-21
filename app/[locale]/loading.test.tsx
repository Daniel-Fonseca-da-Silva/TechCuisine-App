import React from 'react'
import { render, screen } from '@testing-library/react'
import Loading from './loading'

jest.mock('@/components/ui/progress', () => ({
  Progress: ({ value }: { value: number }) => (
    <div data-testid="progress" data-value={value}>
      Progress
    </div>
  ),
}))

jest.mock('@/components/ui/logo', () => ({
  Logo: () => <div data-testid="logo">Logo</div>,
}))

describe('Loading', () => {
  it('renders loading title', () => {
    render(<Loading />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders subtitle text', () => {
    render(<Loading />)
    expect(screen.getByText('Preparing your perfect experience')).toBeInTheDocument()
  })

  it('renders Logo', () => {
    render(<Loading />)
    expect(screen.getByTestId('logo')).toBeInTheDocument()
  })

  it('renders Progress component', () => {
    render(<Loading />)
    expect(screen.getByTestId('progress')).toBeInTheDocument()
  })

  it('renders progress label Starting...', () => {
    render(<Loading />)
    expect(screen.getByText('Starting...')).toBeInTheDocument()
  })

  it('renders developed by badge', () => {
    render(<Loading />)
    expect(screen.getByText('Tech Cuisine')).toBeInTheDocument()
  })

  it('has min-h-screen container', () => {
    const { container } = render(<Loading />)
    const root = container.firstChild as HTMLElement
    expect(root).toHaveClass('min-h-screen')
  })
})
