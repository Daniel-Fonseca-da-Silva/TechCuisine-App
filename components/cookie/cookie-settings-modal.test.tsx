import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { CookieSettingsModal } from './cookie-settings-modal'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

const mockSavePreferences = jest.fn()
const mockRejectAll = jest.fn()
const mockUseCookieConsent = jest.fn()
jest.mock('@/hooks/use-cookie-consent', () => ({
  useCookieConsent: () => mockUseCookieConsent(),
}))

describe('CookieSettingsModal', () => {
  const defaultPreferences = {
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseCookieConsent.mockReturnValue({
      preferences: defaultPreferences,
      savePreferences: mockSavePreferences,
      rejectAll: mockRejectAll,
    })
  })

  it('renders nothing when open is false', () => {
    render(<CookieSettingsModal open={false} onOpenChange={jest.fn()} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders dialog with title and description when open', () => {
    render(<CookieSettingsModal open={true} onOpenChange={jest.fn()} />)
    expect(screen.getByText('title')).toBeInTheDocument()
    expect(screen.getByText('description')).toBeInTheDocument()
  })

  it('renders cookie category cards', () => {
    render(<CookieSettingsModal open={true} onOpenChange={jest.fn()} />)
    expect(screen.getByText('necessary.title')).toBeInTheDocument()
    expect(screen.getByText('analytics.title')).toBeInTheDocument()
    expect(screen.getByText('marketing.title')).toBeInTheDocument()
    expect(screen.getByText('functional.title')).toBeInTheDocument()
  })

  it('renders privacy notice', () => {
    render(<CookieSettingsModal open={true} onOpenChange={jest.fn()} />)
    expect(screen.getByText('privacy.title')).toBeInTheDocument()
  })

  it('renders Reject All and Save buttons', () => {
    render(<CookieSettingsModal open={true} onOpenChange={jest.fn()} />)
    expect(screen.getByRole('button', { name: /rejectAll/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /savePreferences/i })).toBeInTheDocument()
  })

  it('calls onOpenChange(false) and savePreferences when Save is clicked', () => {
    const onOpenChange = jest.fn()
    render(<CookieSettingsModal open={true} onOpenChange={onOpenChange} />)
    fireEvent.click(screen.getByRole('button', { name: /savePreferences/i }))
    expect(mockSavePreferences).toHaveBeenCalledWith(defaultPreferences)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('calls onOpenChange(false) and rejectAll when Reject All is clicked', () => {
    const onOpenChange = jest.fn()
    render(<CookieSettingsModal open={true} onOpenChange={onOpenChange} />)
    fireEvent.click(screen.getByRole('button', { name: /rejectAll/i }))
    expect(mockRejectAll).toHaveBeenCalledTimes(1)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
