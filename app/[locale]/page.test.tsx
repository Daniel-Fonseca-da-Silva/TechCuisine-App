import React from 'react'
import { render, screen } from '@testing-library/react'
import Home from './page'

jest.mock('@/components/layout/header', () => ({
  Header: () => <header data-testid="header">Header</header>,
}))

jest.mock('@/components/features/hero-section', () => ({
  HeroSection: () => <section data-testid="hero-section">HeroSection</section>,
}))

jest.mock('@/components/features/candidate-pain-points-section', () => ({
  CandidatePainPointsSection: () => (
    <section data-testid="candidate-pain-points-section">
      CandidatePainPointsSection
    </section>
  ),
}))

jest.mock('@/components/features/benefits-section', () => ({
  BenefitsSection: () => <section data-testid="benefits-section">BenefitsSection</section>,
}))

jest.mock('@/components/features/demo-section', () => ({
  DemoSection: () => <section data-testid="demo-section">DemoSection</section>,
}))

jest.mock('@/components/features/social-proof-section', () => ({
  SocialProofSection: () => (
    <section data-testid="social-proof-section">SocialProofSection</section>
  ),
}))

jest.mock('@/components/features/results-testimonials-section', () => ({
  ResultsTestimonialsSection: () => (
    <section data-testid="results-testimonials-section">ResultsTestimonialsSection</section>
  ),
}))

jest.mock('@/components/features/faq-section', () => ({
  FaqSection: () => <section data-testid="faq-section">FaqSection</section>,
}))

jest.mock('@/components/features/pain-points-section', () => ({
  PainPointsSection: () => (
    <section data-testid="pain-points-section">PainPointsSection</section>
  ),
}))

jest.mock('@/components/features/how-it-works-section', () => ({
  HowItWorksSection: () => (
    <section data-testid="how-it-works-section">HowItWorksSection</section>
  ),
}))

jest.mock('@/components/features/candidate-ai-toolkit/candidate-ai-toolkit-section', () => ({
  CandidateAiToolkitSection: () => (
    <section data-testid="candidate-ai-toolkit-section">CandidateAiToolkitSection</section>
  ),
}))

jest.mock('@/components/layout/footer', () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>,
}))

describe('Home page', () => {
  it('renders main with min-h-screen class', () => {
    const { container } = render(<Home />)
    const main = container.querySelector('main')
    expect(main).toBeInTheDocument()
    expect(main).toHaveClass('min-h-screen')
  })

  it('renders Header', () => {
    render(<Home />)
    expect(screen.getByTestId('header')).toBeInTheDocument()
  })

  it('renders HeroSection', () => {
    render(<Home />)
    expect(screen.getByTestId('hero-section')).toBeInTheDocument()
  })

  it('renders PainPointsSection', () => {
    render(<Home />)
    expect(screen.getByTestId('pain-points-section')).toBeInTheDocument()
  })

  it('renders BenefitsSection', () => {
    render(<Home />)
    expect(screen.getByTestId('benefits-section')).toBeInTheDocument()
  })

  it('renders HowItWorksSection', () => {
    render(<Home />)
    expect(screen.getByTestId('how-it-works-section')).toBeInTheDocument()
  })

  it('renders CandidateAiToolkitSection', () => {
    render(<Home />)
    expect(screen.getByTestId('candidate-ai-toolkit-section')).toBeInTheDocument()
  })

  it('renders DemoSection', () => {
    render(<Home />)
    expect(screen.getByTestId('demo-section')).toBeInTheDocument()
  })

  it('renders ResultsTestimonialsSection', () => {
    render(<Home />)
    expect(screen.getByTestId('results-testimonials-section')).toBeInTheDocument()
  })

  it('renders FaqSection', () => {
    render(<Home />)
    expect(screen.getByTestId('faq-section')).toBeInTheDocument()
  })

  it('renders SocialProofSection', () => {
    render(<Home />)
    expect(screen.getByTestId('social-proof-section')).toBeInTheDocument()
  })

  it('renders Footer', () => {
    render(<Home />)
    expect(screen.getByTestId('footer')).toBeInTheDocument()
  })

  it('renders sections in correct order', () => {
    const { container } = render(<Home />)
    const main = container.querySelector('main')
    const children = main?.querySelectorAll(':scope > *') ?? []
    const testIds = Array.from(children).map((el) => el.getAttribute('data-testid'))
    expect(testIds).toEqual([
      'header',
      'hero-section',
      'candidate-pain-points-section',
      'pain-points-section',
      'benefits-section',
      'how-it-works-section',
      'candidate-ai-toolkit-section',
      'demo-section',
      'results-testimonials-section',
      'faq-section',
      'social-proof-section',
      'footer',
    ])
  })
})
