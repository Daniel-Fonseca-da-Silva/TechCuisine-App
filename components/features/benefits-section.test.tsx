import React from 'react'
import { render, screen } from '@testing-library/react'
import { BenefitsSection } from './benefits-section'

jest.mock('next-intl', () => ({
  useTranslations: () => {
    const t = (key: string) => key
    ;(t as { raw: (k: string) => Array<{ icon: string; title: string; description: string }> }).raw = (k: string) =>
      k === 'items' ? [{ icon: 'zap', title: 'Fast', description: 'Quick results' }] : []
    return t
  },
}))

describe('BenefitsSection', () => {
  it('renders section title', () => {
    render(<BenefitsSection />)
    expect(screen.getByText('title')).toBeInTheDocument()
  })

  it('renders benefit items from t.raw', () => {
    render(<BenefitsSection />)
    expect(screen.getByText('Fast')).toBeInTheDocument()
    expect(screen.getByText('Quick results')).toBeInTheDocument()
  })
})
