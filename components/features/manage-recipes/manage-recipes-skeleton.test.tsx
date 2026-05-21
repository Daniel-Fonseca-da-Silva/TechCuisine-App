import React from 'react'
import { render } from '@testing-library/react'
import { RecipeSkeleton } from './manage-recipes-skeleton'

describe('RecipeSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<RecipeSkeleton />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders card with skeleton elements', () => {
    const { container } = render(<RecipeSkeleton />)
    const skeletons = container.querySelectorAll('[class*="bg-white/20"]')
    expect(skeletons.length).toBeGreaterThan(0)
    const card = container.querySelector('[class*="backdrop-blur-xl"]')
    expect(card).toBeInTheDocument()
  })
})
