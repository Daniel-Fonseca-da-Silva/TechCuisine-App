import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AdminUsersList } from './admin-users-list'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('./admin-user-detail-dialog', () => ({
  AdminUserDetailDialog: ({
    user,
    open,
    onOpenChange,
  }: {
    user: { name: string; email: string } | null
    open: boolean
    onOpenChange: (o: boolean) => void
  }) =>
    open && user ? (
      <div data-testid="user-detail-dialog">
        <span>{user.name}</span>
        <button type="button" onClick={() => onOpenChange(false)}>
          Close
        </button>
      </div>
    ) : null,
}))

describe('AdminUsersList', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  it('shows loading skeletons initially', () => {
    ;(global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}))
    const { container } = render(
      <AdminUsersList onToggleAdmin={jest.fn()} />
    )
    const skeletons = container.querySelectorAll('[class*="bg-white/20"]')
    expect(skeletons.length).toBeGreaterThan(0)
    expect(screen.getByText('users')).toBeInTheDocument()
  })

  it('shows users when fetch succeeds', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [
            {
              id: 'u1',
              name: 'Alice',
              email: 'alice@example.com',
              admin: false,
              created_at: '2024-01-01',
              updated_at: '2024-01-02',
            },
          ],
          pagination: { has_next_page: false },
        }),
    })
    render(<AdminUsersList onToggleAdmin={jest.fn()} />)
    await waitFor(() => {
      expect(screen.getAllByText('Alice').length).toBeGreaterThan(0)
      expect(screen.getAllByText('alice@example.com').length).toBeGreaterThan(0)
    })
    expect(screen.getAllByRole('button', { name: /details/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: /toggleAdmin/i }).length).toBeGreaterThan(0)
  })

  it('shows empty count when data is empty', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [], pagination: { has_next_page: false } }),
    })
    render(<AdminUsersList onToggleAdmin={jest.fn()} />)
    await waitFor(() => {
      expect(screen.getByText(/users: 0/i)).toBeInTheDocument()
    })
  })

  it('calls onToggleAdmin when toggle button is clicked', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [
            {
              id: 'u1',
              name: 'Bob',
              email: 'bob@example.com',
              admin: false,
              created_at: '2024-01-01',
              updated_at: '2024-01-02',
            },
          ],
          pagination: { has_next_page: false },
        }),
    })
    const onToggleAdmin = jest.fn().mockResolvedValue(undefined)
    render(<AdminUsersList onToggleAdmin={onToggleAdmin} />)
    await waitFor(() => {
      expect(screen.getAllByText('Bob').length).toBeGreaterThan(0)
    })
    fireEvent.click(screen.getAllByRole('button', { name: /toggleAdmin/i })[0])
    await waitFor(() => {
      expect(onToggleAdmin).toHaveBeenCalledWith('u1')
    })
  })
})
