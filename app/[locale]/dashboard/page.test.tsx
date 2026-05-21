import React from 'react'
import { render, screen } from '@testing-library/react'
import { useUserData as useUserDataHook } from '@/hooks/use-user-data'
import DashboardPage from './page'

const mockRefetch = jest.fn()
const useUserData = useUserDataHook as jest.Mock

jest.mock('@/hooks/use-user-data', () => ({
  useUserData: jest.fn(),
}))

jest.mock('@/hooks/use-locale', () => ({
  useLocale: () => ({ locale: 'en', changeLocale: jest.fn() }),
}))

jest.mock('@/components/layout/dashboard-layout', () => ({
  DashboardLayout: ({
    children,
    activeSection,
    onSectionChange,
  }: {
    children: React.ReactNode
    userData: unknown
    activeSection: string
    onSectionChange: (s: string) => void
  }) => (
    <div data-testid="dashboard-layout">
      <span data-testid="active-section">{activeSection}</span>
      <button onClick={() => onSectionChange('profile')}>Change to profile</button>
      {children}
    </div>
  ),
}))

jest.mock('@/components/features/dashboard-content', () => ({
  DashboardContent: ({
    activeSection,
    onSectionChange,
    isAdmin,
    onUserDataRefetch,
  }: {
    activeSection: string
    onSectionChange: (s: string) => void
    isAdmin: boolean
    onUserDataRefetch: () => void
  }) => (
    <div data-testid="dashboard-content">
      <span data-testid="content-section">{activeSection}</span>
      <span data-testid="is-admin">{String(isAdmin)}</span>
      <button onClick={() => onSectionChange('settings')}>Go to settings</button>
      <button onClick={onUserDataRefetch}>Refetch</button>
    </div>
  ),
}))

describe('DashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows loading state when useUserData is loading', () => {
    useUserData.mockReturnValue({
      userData: null,
      preferencesLanguage: null,
      isInitialLoading: true,
      error: null,
      refetch: mockRefetch,
    })
    render(<DashboardPage />)
    expect(screen.getByText('Carregando...')).toBeInTheDocument()
    expect(screen.queryByTestId('dashboard-layout')).not.toBeInTheDocument()
  })

  it('shows error state when useUserData has error', () => {
    useUserData.mockReturnValue({
      userData: null,
      preferencesLanguage: ['en'],
      isInitialLoading: false,
      error: 'Network error',
      refetch: mockRefetch,
    })
    render(<DashboardPage />)
    expect(screen.getByText(/Erro:/)).toBeInTheDocument()
    expect(screen.getByText(/Network error/)).toBeInTheDocument()
    expect(screen.queryByTestId('dashboard-layout')).not.toBeInTheDocument()
  })

  it('renders DashboardLayout and DashboardContent when data is loaded', () => {
    useUserData.mockReturnValue({
      userData: { id: '1', email: 'user@test.com', admin: false },
      preferencesLanguage: ['en'],
      isInitialLoading: false,
      error: null,
      refetch: mockRefetch,
    })
    render(<DashboardPage />)
    expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument()
    expect(screen.getByTestId('dashboard-content')).toBeInTheDocument()
  })

  it('passes isAdmin true when userData.admin is true', () => {
    useUserData.mockReturnValue({
      userData: { id: '1', email: 'admin@test.com', admin: true },
      preferencesLanguage: ['en'],
      isInitialLoading: false,
      error: null,
      refetch: mockRefetch,
    })
    render(<DashboardPage />)
    expect(screen.getByTestId('is-admin')).toHaveTextContent('true')
  })

  it('passes isAdmin false when userData.admin is false', () => {
    useUserData.mockReturnValue({
      userData: { id: '1', email: 'user@test.com', admin: false },
      preferencesLanguage: ['en'],
      isInitialLoading: false,
      error: null,
      refetch: mockRefetch,
    })
    render(<DashboardPage />)
    expect(screen.getByTestId('is-admin')).toHaveTextContent('false')
  })

  it('passes refetch to DashboardContent', () => {
    useUserData.mockReturnValue({
      userData: { id: '1' },
      preferencesLanguage: ['en'],
      isInitialLoading: false,
      error: null,
      refetch: mockRefetch,
    })
    render(<DashboardPage />)
    const refetchButton = screen.getByRole('button', { name: 'Refetch' })
    refetchButton.click()
    expect(mockRefetch).toHaveBeenCalled()
  })
})
