import React from 'react'
import { render, screen } from '@testing-library/react'
import { CandidatePainPointsSection } from './candidate-pain-points-section'

jest.mock('next-intl', () => ({
  useTranslations: () => {
    const t = (key: string) => key
    ;(t as { raw: (k: string) => Array<{ icon: string; title: string; description: string }> }).raw = (k: string) =>
      k === 'points' ? [{ icon: 'ats', title: 'Pass ATS', description: 'Make it readable' }] : []
    return t
  },
}))

jest.mock('@/i18n/navigation', () => ({
  Link: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

describe('CandidatePainPointsSection', () => {
  it('renders section title and subtitle', () => {
    render(<CandidatePainPointsSection />)
    expect(screen.getByText('title')).toBeInTheDocument()
    expect(screen.getByText('subtitle')).toBeInTheDocument()
  })

  it('renders points from t.raw', () => {
    render(<CandidatePainPointsSection />)
    expect(screen.getByText('Pass ATS')).toBeInTheDocument()
    expect(screen.getByText('Make it readable')).toBeInTheDocument()
  })

  it('renders CTA', () => {
    render(<CandidatePainPointsSection />)
    expect(screen.getByText('cta')).toBeInTheDocument()
  })
})

