import React from 'react'
import { render, screen } from '@testing-library/react'
import { PainPointsSection } from './pain-points-section'

jest.mock('next-intl', () => ({
  useTranslations: () => {
    const t = (key: string) => key
    ;(t as { raw: (k: string) => Array<{ icon: string; title: string; description: string }> }).raw = (k: string) =>
      k === 'points' ? [{ icon: 'time', title: 'Waste', description: 'Too much time' }] : []
    return t
  },
}))

describe('PainPointsSection', () => {
  it('renders section title and subtitle', () => {
    render(<PainPointsSection />)
    expect(screen.getByText('title')).toBeInTheDocument()
    expect(screen.getByText('subtitle')).toBeInTheDocument()
  })

  it('renders pain points from t.raw', () => {
    render(<PainPointsSection />)
    expect(screen.getByText('Waste')).toBeInTheDocument()
    expect(screen.getByText('Too much time')).toBeInTheDocument()
  })
})
