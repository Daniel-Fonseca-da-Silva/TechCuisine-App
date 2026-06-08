import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SettingsSection } from './settings-section'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

const mockChangeLocale = jest.fn()
jest.mock('@/hooks/use-locale', () => ({
  useLocale: () => ({ locale: 'en', changeLocale: mockChangeLocale }),
}))

jest.mock('@/components/features/settings/settings-skeleton', () => ({
  SettingsSkeleton: () => <div data-testid="settings-skeleton">Loading...</div>,
}))

jest.mock('@/lib/shared/language-flag', () => ({
  languageOptions: [
    { code: 'en', name: 'English', flag: () => null },
    { code: 'pt', name: 'Português', flag: () => null },
  ],
  getLanguageOption: (code: string) =>
    code === 'en' ? { code: 'en', name: 'English', flag: () => null } : { code: 'pt', name: 'Português', flag: () => null },
}))

const defaultPreferences = {
  language: ['en'],
  email_notifications: false,
  temperature_unit: 'celsius',
  currency: 'EUR',
  date_format: 'DD/MM/YYYY',
  decimal_separator: ',',
}

describe('SettingsSection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  it('shows skeleton while loading', async () => {
    ;(global.fetch as jest.Mock).mockImplementation(
      () => new Promise(() => {})
    )
    render(<SettingsSection />)
    expect(screen.getByTestId('settings-skeleton')).toBeInTheDocument()
  })

  it('shows error when fetch fails', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Failed to load' }),
    })
    render(<SettingsSection />)
    await waitFor(() => {
      expect(screen.getByText('Failed to load')).toBeInTheDocument()
    })
  })

  it('renders header and cards when load succeeds', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: defaultPreferences,
      }),
    })
    render(<SettingsSection />)
    await waitFor(() => {
      expect(screen.getByText('header.title')).toBeInTheDocument()
    })
    expect(screen.getByText('notifications.title')).toBeInTheDocument()
    expect(screen.getByText('appearance.title')).toBeInTheDocument()
  })

  it('calls onSectionChange when Back is clicked', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: defaultPreferences }),
    })
    const onSectionChange = jest.fn()
    render(<SettingsSection onSectionChange={onSectionChange} />)
    await waitFor(() => {
      expect(screen.getByTestId('section-back-button')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByTestId('section-back-button'))
    expect(onSectionChange).toHaveBeenCalledWith('dashboard')
  })

  it('does not render Back button when onSectionChange is not provided', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: defaultPreferences }),
    })
    render(<SettingsSection />)
    await waitFor(() => {
      expect(screen.getByText('header.title')).toBeInTheDocument()
    })
    expect(screen.queryByTestId('section-back-button')).not.toBeInTheDocument()
  })

  it('calls fetch with PATCH to /api/preferences when Save is clicked', async () => {
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: defaultPreferences }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    render(<SettingsSection />)
    await waitFor(() => {
      expect(screen.getByText('appearance.saveButton')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText('appearance.saveButton'))
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/preferences',
        expect.objectContaining({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            language: ['en'],
            email_notifications: false,
            temperature_unit: 'celsius',
            currency: 'EUR',
            date_format: 'DD/MM/YYYY',
            decimal_separator: ',',
          }),
        })
      )
    })
  })
})
