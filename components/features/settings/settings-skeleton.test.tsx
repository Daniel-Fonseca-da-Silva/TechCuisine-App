import React from 'react'
import { render } from '@testing-library/react'
import { SettingsSkeleton } from './settings-skeleton'

describe('SettingsSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<SettingsSkeleton />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders two main cards in the grid', () => {
    const { container } = render(<SettingsSkeleton />)
    const cards = container.querySelectorAll('[class*="backdrop-blur-xl"]')
    expect(cards.length).toBeGreaterThanOrEqual(2)
  })

  it('renders skeleton elements', () => {
    const { container } = render(<SettingsSkeleton />)
    const skeletons = container.querySelectorAll('[class*="animate-pulse"], [class*="bg-white/20"]')
    expect(skeletons.length).toBeGreaterThan(0)
  })
})
