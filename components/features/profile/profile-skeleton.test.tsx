import React from 'react'
import { render } from '@testing-library/react'
import { ProfileSkeleton } from './profile-skeleton'

describe('ProfileSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<ProfileSkeleton />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders multiple cards', () => {
    const { container } = render(<ProfileSkeleton />)
    const cards = container.querySelectorAll('[class*="backdrop-blur-xl"]')
    expect(cards.length).toBeGreaterThanOrEqual(2)
  })

  it('renders skeleton elements', () => {
    const { container } = render(<ProfileSkeleton />)
    const skeletons = container.querySelectorAll('[class*="bg-white/20"]')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders photo area skeleton', () => {
    const { container } = render(<ProfileSkeleton />)
    const roundedFull = container.querySelector('.rounded-full')
    expect(roundedFull).toBeInTheDocument()
  })
})
