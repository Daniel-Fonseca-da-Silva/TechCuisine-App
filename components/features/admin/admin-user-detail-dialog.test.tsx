import React from 'react'
import { render, screen } from '@testing-library/react'
import { AdminUserDetailDialog } from './admin-user-detail-dialog'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

const mockUser = {
  id: 'user-1',
  name: 'Jane Doe',
  email: 'jane@example.com',
  admin: true,
  created_at: '2024-01-01T12:00:00Z',
  updated_at: '2024-01-02T12:00:00Z',
}

describe('AdminUserDetailDialog', () => {
  it('returns null when user is null', () => {
    const { container } = render(
      <AdminUserDetailDialog user={null} open={false} onOpenChange={jest.fn()} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders dialog with user details when open', () => {
    const onOpenChange = jest.fn()
    render(
      <AdminUserDetailDialog
        user={mockUser}
        open
        onOpenChange={onOpenChange}
      />
    )
    expect(screen.getByText('userDetail')).toBeInTheDocument()
    expect(screen.getAllByText('jane@example.com').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    expect(screen.getByText('user-1')).toBeInTheDocument()
    expect(screen.getByText('Yes')).toBeInTheDocument()
  })

  it('renders translation keys for labels', () => {
    render(
      <AdminUserDetailDialog
        user={mockUser}
        open
        onOpenChange={jest.fn()}
      />
    )
    expect(screen.getByText('id')).toBeInTheDocument()
    expect(screen.getByText('name')).toBeInTheDocument()
    expect(screen.getByText('email')).toBeInTheDocument()
    expect(screen.getByText('admin')).toBeInTheDocument()
    expect(screen.getByText('createdAt')).toBeInTheDocument()
    expect(screen.getByText('updatedAt')).toBeInTheDocument()
  })

  it('shows No when user is not admin', () => {
    render(
      <AdminUserDetailDialog
        user={{ ...mockUser, admin: false }}
        open
        onOpenChange={jest.fn()}
      />
    )
    expect(screen.getByText('No')).toBeInTheDocument()
  })
})
