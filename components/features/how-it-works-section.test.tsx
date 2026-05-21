import React from 'react'
import { render, screen } from '@testing-library/react'
import { HowItWorksSection } from './how-it-works-section'

jest.mock('next-intl', () => ({
  useTranslations: () => {
    const t = (key: string) => key
    ;(t as { raw: (k: string) => { title: string; description: string } }).raw = (k: string) => ({
      title: `${k} title`,
      description: `${k} desc`,
    })
    return t
  },
}))

describe('HowItWorksSection', () => {
  it('renders section title', () => {
    render(<HowItWorksSection />)
    expect(screen.getByText('title')).toBeInTheDocument()
  })

  it('renders four steps with titles from t.raw', () => {
    render(<HowItWorksSection />)
    expect(screen.getByText('step1 title')).toBeInTheDocument()
    expect(screen.getByText('step2 title')).toBeInTheDocument()
    expect(screen.getByText('step3 title')).toBeInTheDocument()
    expect(screen.getByText('step4 title')).toBeInTheDocument()
  })
})
