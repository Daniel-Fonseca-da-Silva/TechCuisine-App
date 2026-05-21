import React from 'react'
import { render } from '@testing-library/react'
import { PlansSkeleton } from './plans-skeleton'

describe('PlansSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<PlansSkeleton />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders skeleton cards and elements', () => {
    const { container } = render(<PlansSkeleton />)
    const skeletons = container.querySelectorAll('[class*="bg-white/20"]')
    expect(skeletons.length).toBeGreaterThan(0)
    const cards = container.querySelectorAll('[class*="backdrop-blur-xl"]')
    expect(cards.length).toBeGreaterThanOrEqual(2)
  })

  it('renders back button skeleton when showBackButton is true', () => {
    const { container } = render(<PlansSkeleton showBackButton />)
    const skeletons = container.querySelectorAll('[class*="bg-white/20"]')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders correct structure with multiple cards', () => {
    const { container } = render(<PlansSkeleton showBackButton={false} />)
    const cards = container.querySelectorAll('[class*="backdrop-blur-xl"]')
    expect(cards.length).toBeGreaterThanOrEqual(2)
  })
})
