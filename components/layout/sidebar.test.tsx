import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Sidebar } from './sidebar'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

jest.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({ checkSession: jest.fn().mockResolvedValue(undefined) }),
}))

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: { src: string; alt: string }) => <img src={props.src} alt={props.alt} />,
}))

describe('Sidebar', () => {
  it('renders user name and email', () => {
    render(
      <Sidebar
        activeSection="dashboard"
        onSectionChange={jest.fn()}
        userName="Jane"
        userEmail="jane@example.com"
        isCollapsed={false}
        onToggleCollapse={jest.fn()}
      />
    )
    expect(screen.getByText('Jane')).toBeInTheDocument()
    expect(screen.getByText('jane@example.com')).toBeInTheDocument()
  })

  it('calls onSectionChange when menu item is clicked', async () => {
    const onSectionChange = jest.fn()
    render(
      <Sidebar
        activeSection="dashboard"
        onSectionChange={onSectionChange}
        isCollapsed={false}
        onToggleCollapse={jest.fn()}
      />
    )
    fireEvent.click(screen.getByText('menuItems.profile.label'))
    await waitFor(() => expect(onSectionChange).toHaveBeenCalledWith('profile'))
  })

  it('renders logout button', () => {
    render(
      <Sidebar
        activeSection="dashboard"
        onSectionChange={jest.fn()}
        isCollapsed={false}
        onToggleCollapse={jest.fn()}
      />
    )
    expect(screen.getByText('logout')).toBeInTheDocument()
  })

  it('shows admin menu item when isAdmin is true', () => {
    render(
      <Sidebar
        activeSection="dashboard"
        onSectionChange={jest.fn()}
        isCollapsed={false}
        onToggleCollapse={jest.fn()}
        isAdmin
      />
    )
    expect(screen.getByText('menuItems.admin.label')).toBeInTheDocument()
  })

  it('calls onMobileClose when close button is clicked in mobile mode', () => {
    const onMobileClose = jest.fn()
    render(
      <Sidebar
        activeSection="dashboard"
        onSectionChange={jest.fn()}
        isCollapsed={false}
        onToggleCollapse={jest.fn()}
        isMobile
        onMobileClose={onMobileClose}
      />
    )
    const buttons = screen.getAllByRole('button')
    const closeButton = buttons[0]
    fireEvent.click(closeButton)
    expect(onMobileClose).toHaveBeenCalled()
  })
})
