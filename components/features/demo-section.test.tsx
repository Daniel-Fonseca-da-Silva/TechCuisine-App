import React from 'react'
import { render, screen } from '@testing-library/react'
import { DemoSection } from './demo-section'

beforeAll(() => {
  global.IntersectionObserver = class IntersectionObserver {
    observe = jest.fn()
    disconnect = jest.fn()
    unobserve = jest.fn()
    root = null
    rootMargin = ''
    thresholds = []
    takeRecords = () => []
    constructor(callback: IntersectionObserverCallback) {
      setTimeout(() => callback([{ isIntersecting: true } as IntersectionObserverEntry], this), 0)
    }
  }
})

jest.mock('next-intl', () => ({
  useTranslations: () => {
    const t = (key: string) => key
    ;(t as { raw: (k: string) => unknown[] }).raw = (k: string) => {
      if (k === 'features') return [{ title: 'Feature A', description: 'Desc A' }]
      if (k === 'stats') return [{ number: '100', label: 'Users', color: 'text-white' }]
      return []
    }
    return t
  },
}))

jest.mock('@/i18n/navigation', () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

describe('DemoSection', () => {
  it('renders video element with correct src', () => {
    const { container } = render(<DemoSection />)
    const video = container.querySelector('video')
    expect(video).not.toBeNull()
    expect(video).toHaveAttribute('src', '/TechCuisine-Intro.mp4')
    expect((video as HTMLVideoElement).muted).toBe(true)
    expect(video).toHaveAttribute('loop')
  })

  it('renders section title and subtitle', () => {
    render(<DemoSection />)
    expect(screen.getByText('title')).toBeInTheDocument()
    expect(screen.getByText('subtitle')).toBeInTheDocument()
  })

  it('renders features from t.raw', () => {
    render(<DemoSection />)
    expect(screen.getByText('Feature A')).toBeInTheDocument()
    expect(screen.getByText('Desc A')).toBeInTheDocument()
  })

  it('renders CTA link to register', () => {
    render(<DemoSection />)
    const link = screen.getByRole('link', { name: /cta/i })
    expect(link).toHaveAttribute('href', '/auth/register')
  })

  it('renders stats from t.raw', () => {
    render(<DemoSection />)
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('Users')).toBeInTheDocument()
  })
})
