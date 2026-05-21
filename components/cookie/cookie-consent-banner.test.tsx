import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { CookieConsentBanner } from './cookie-consent-banner'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

const mockAcceptAll = jest.fn()
const mockUseCookieConsent = jest.fn()
jest.mock('@/hooks/use-cookie-consent', () => ({
  useCookieConsent: () => mockUseCookieConsent(),
}))

jest.mock('./cookie-settings-modal', () => ({
  CookieSettingsModal: ({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) =>
    open ? (
      <div data-testid="cookie-settings-modal">
        <button onClick={() => onOpenChange(false)}>Close modal</button>
      </div>
    ) : null,
}))

describe('CookieConsentBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseCookieConsent.mockReturnValue({
      consentGiven: false,
      isLoading: false,
      acceptAll: mockAcceptAll,
    })
  })

  it('returns null when isLoading is true', () => {
    mockUseCookieConsent.mockReturnValue({
      consentGiven: false,
      isLoading: true,
      acceptAll: mockAcceptAll,
    })
    const { container } = render(<CookieConsentBanner />)
    expect(container.firstChild).toBeNull()
  })

  it('returns null when consentGiven is true', () => {
    mockUseCookieConsent.mockReturnValue({
      consentGiven: true,
      isLoading: false,
      acceptAll: mockAcceptAll,
    })
    const { container } = render(<CookieConsentBanner />)
    expect(container.firstChild).toBeNull()
  })

  it('renders banner with title and description when consent not given', () => {
    render(<CookieConsentBanner />)
    expect(screen.getByText('title')).toBeInTheDocument()
    expect(screen.getByText('description')).toBeInTheDocument()
  })

  it('renders necessary, analytics and marketing labels', () => {
    render(<CookieConsentBanner />)
    expect(screen.getByText('necessary')).toBeInTheDocument()
    expect(screen.getByText('analytics')).toBeInTheDocument()
    expect(screen.getByText('marketing')).toBeInTheDocument()
  })

  it('renders Settings and Accept All buttons', () => {
    render(<CookieConsentBanner />)
    expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /acceptAll/i })).toBeInTheDocument()
  })

  it('calls acceptAll when Accept All is clicked', () => {
    render(<CookieConsentBanner />)
    fireEvent.click(screen.getByRole('button', { name: /acceptAll/i }))
    expect(mockAcceptAll).toHaveBeenCalledTimes(1)
  })

  it('opens settings modal when Settings is clicked', () => {
    render(<CookieConsentBanner />)
    expect(screen.queryByTestId('cookie-settings-modal')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /settings/i }))
    expect(screen.getByTestId('cookie-settings-modal')).toBeInTheDocument()
  })

  it('closes settings modal when modal close is triggered', () => {
    render(<CookieConsentBanner />)
    fireEvent.click(screen.getByRole('button', { name: /settings/i }))
    expect(screen.getByTestId('cookie-settings-modal')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Close modal'))
    expect(screen.queryByTestId('cookie-settings-modal')).not.toBeInTheDocument()
  })
})
