import React from 'react'
import { render, screen } from '@testing-library/react'
import { ResultsTestimonialsSection } from './results-testimonials-section'

const mockMetrics = [
  { number: '10,000+', label: 'CVs Created' },
  { number: '92%', label: 'Average Match Score' },
  { number: '24/7', label: 'AI Analysis' },
]

const mockTestimonials = [
  {
    quote: 'We cut candidate screening time by half.',
    authorName: 'Maria Santos',
    authorRole: 'Recruitment Lead',
    resultValue: '85%',
    resultLabel: 'Match Score',
  },
]

jest.mock('next-intl', () => ({
  useTranslations: () => {
    const t = (key: string) => key
    ;(t as { raw: (k: string) => unknown }).raw = (k: string) => {
      if (k === 'metrics') return mockMetrics
      if (k === 'testimonials') return mockTestimonials
      return []
    }
    return t
  },
}))

describe('ResultsTestimonialsSection', () => {
  it('renders section title and subtitle', () => {
    render(<ResultsTestimonialsSection />)
    expect(screen.getByText('title')).toBeInTheDocument()
    expect(screen.getByText('subtitle')).toBeInTheDocument()
  })

  it('renders metrics from t.raw', () => {
    render(<ResultsTestimonialsSection />)
    expect(screen.getByText('10,000+')).toBeInTheDocument()
    expect(screen.getByText('CVs Created')).toBeInTheDocument()
    expect(screen.getByText('92%')).toBeInTheDocument()
    expect(screen.getByText('Average Match Score')).toBeInTheDocument()
    expect(screen.getByText('24/7')).toBeInTheDocument()
    expect(screen.getByText('AI Analysis')).toBeInTheDocument()
  })

  it('renders testimonials with quote, author and result', () => {
    render(<ResultsTestimonialsSection />)
    expect(screen.getByText('We cut candidate screening time by half.')).toBeInTheDocument()
    expect(screen.getByText('Maria Santos')).toBeInTheDocument()
    expect(screen.getByText('Recruitment Lead')).toBeInTheDocument()
    expect(screen.getByText('85%')).toBeInTheDocument()
    expect(screen.getByText('Match Score')).toBeInTheDocument()
  })
})
