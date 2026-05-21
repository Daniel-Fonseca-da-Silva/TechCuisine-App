import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DashboardLayout } from './dashboard-layout'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ replace: jest.fn() }),
}))

jest.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({ checkSession: jest.fn().mockResolvedValue(undefined) }),
}))

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: { src: string; alt: string }) => <img src={props.src} alt={props.alt} />,
}))

jest.mock('@/components/layout/sidebar', () => ({
  Sidebar: ({
    onSectionChange,
    onMobileClose,
  }: {
    onSectionChange: (s: string) => void
    onMobileClose: () => void
  }) => (
    <div data-testid="sidebar">
      <button type="button" onClick={() => onSectionChange('profile')}>Profile</button>
      <button type="button" onClick={onMobileClose}>Close</button>
    </div>
  ),
}))

jest.mock('../ui/alert-dialog-custom', () => ({
  __esModule: true,
  default: ({ alertTitle }: { alertTitle: string }) => <div data-testid="premium-alert">{alertTitle}</div>,
}))

const defaultUserData = {
  name: 'Jane',
  email: 'jane@example.com',
  image_url: undefined,
  admin: false,
}

describe('DashboardLayout', () => {
  it('renders sidebar and user info', () => {
    render(
      <DashboardLayout
        userData={defaultUserData}
        activeSection="dashboard"
        onSectionChange={jest.fn()}
      >
        <div>Content</div>
      </DashboardLayout>
    )
    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
    expect(screen.getByText('Jane')).toBeInTheDocument()
    expect(screen.getByText('jane@example.com')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('calls onSectionChange when sidebar section is clicked', async () => {
    const onSectionChange = jest.fn()
    render(
      <DashboardLayout
        userData={defaultUserData}
        activeSection="dashboard"
        onSectionChange={onSectionChange}
      />
    )
    fireEvent.click(screen.getByText('Profile'))
    await waitFor(() => expect(onSectionChange).toHaveBeenCalledWith('profile'))
  })

  it('shows section title for active section', () => {
    render(
      <DashboardLayout
        userData={defaultUserData}
        activeSection="dashboard"
        onSectionChange={jest.fn()}
      />
    )
    expect(screen.getByText('dashboard.title')).toBeInTheDocument()
  })
})
