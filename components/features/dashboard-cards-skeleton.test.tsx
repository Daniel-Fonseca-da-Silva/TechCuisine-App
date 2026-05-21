import React from 'react'
import { render } from '@testing-library/react'
import { DashboardCardsSkeleton } from './dashboard-cards-skeleton'

describe('DashboardCardsSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<DashboardCardsSkeleton />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders skeleton elements', () => {
    const { container } = render(<DashboardCardsSkeleton />)
    const skeletons = container.querySelectorAll('[class*="bg-white/20"]')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders default 8 skeleton cards', () => {
    const { container } = render(<DashboardCardsSkeleton />)
    const cards = container.querySelectorAll('[class*="backdrop-blur-xl"]')
    expect(cards.length).toBe(8)
  })

  it('renders custom count of skeleton cards', () => {
    const { container } = render(<DashboardCardsSkeleton count={7} />)
    const cards = container.querySelectorAll('[class*="backdrop-blur-xl"]')
    expect(cards.length).toBe(7)
  })

  it('renders animated skeleton placeholders', () => {
    const { container } = render(<DashboardCardsSkeleton />)
    const animated = container.querySelectorAll('[class*="animate-pulse"]')
    expect(animated.length).toBeGreaterThan(0)
  })

  it('renders grid container', () => {
    const { container } = render(<DashboardCardsSkeleton />)
    const grid = container.querySelector('[class*="grid"]')
    expect(grid).toBeInTheDocument()
  })
})
