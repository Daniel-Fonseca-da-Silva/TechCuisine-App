import React from 'react'
import { render, screen } from '@testing-library/react'
import { SocialProofSection } from './social-proof-section'

jest.mock('next-intl', () => ({
  useTranslations: () => {
    const t = (key: string) => key
    ;(t as { raw: (k: string) => Array<{ number: string; label: string; color: string }> }).raw = (k: string) =>
      k === 'stats' ? [{ number: '500', label: 'Users', color: 'text-green-400' }] : []
    return t
  },
}))

describe('SocialProofSection', () => {
  it('renders section title', () => {
    render(<SocialProofSection />)
    expect(screen.getByText('title')).toBeInTheDocument()
  })

  it('renders stats from t.raw', () => {
    render(<SocialProofSection />)
    expect(screen.getByText('500')).toBeInTheDocument()
    expect(screen.getByText('Users')).toBeInTheDocument()
  })
})
