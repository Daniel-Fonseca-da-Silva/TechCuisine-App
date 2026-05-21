import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { AdminSection } from './admin-section'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}))

jest.mock('./admin-stats', () => ({
  AdminStats: ({
    stats,
    isLoading,
  }: {
    stats: object | null
    isLoading: boolean
  }) => (
    <div data-testid="admin-stats">
      {isLoading || !stats ? 'Loading' : 'Stats loaded'}
    </div>
  ),
}))

jest.mock('./admin-users-list', () => ({
  AdminUsersList: ({ onToggleAdmin }: { onToggleAdmin: (id: string) => Promise<void> }) => (
    <div data-testid="admin-users-list">
      <button type="button" onClick={() => onToggleAdmin('u1')}>
        Toggle
      </button>
    </div>
  ),
}))

jest.mock('./admin-analytics-charts', () => ({
  AdminAnalyticsCharts: () => <div data-testid="admin-analytics-charts" />,
}))

jest.mock('./admin-roles-summary', () => ({
  AdminRolesSummary: () => <div data-testid="admin-roles-summary" />,
}))

jest.mock('./admin-subscriptions-overview', () => ({
  AdminSubscriptionsOverview: () => <div data-testid="admin-subscriptions-overview" />,
}))

const dashboardPayload = {
  users: 10,
  ingredients: 5,
  recipes: 3,
  plates: 2,
  suppliers: 4,
  sales_records: 8,
  total_sales_line_total: '500.00',
  total_recipe_cost: '250.00',
}

const analyticsPayload = {
  employed_count: 5,
  not_employed_count: 2,
  user_role_count: 10,
  business_role_count: 3,
  top_countries: [],
  top_states: [],
  subscriptions: [],
}

describe('AdminSection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  it('renders AdminStats and user list when dashboard load succeeds', async () => {
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(dashboardPayload),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(analyticsPayload),
      })
    render(
      <AdminSection
        onSectionChange={jest.fn()}
        onAccessDenied={jest.fn()}
      />
    )
    await waitFor(() => {
      expect(screen.getByTestId('admin-stats')).toBeInTheDocument()
    })
    expect(screen.getByTestId('admin-users-list')).toBeInTheDocument()
  })

  it('shows error when dashboard fetch fails', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: 'Failed' }),
    })
    render(
      <AdminSection
        onSectionChange={jest.fn()}
        onAccessDenied={jest.fn()}
      />
    )
    await waitFor(() => {
      expect(screen.getByText('Failed')).toBeInTheDocument()
    })
  })

  it('calls onAccessDenied when dashboard returns 403', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      status: 403,
      ok: false,
      json: () => Promise.resolve({}),
    })
    const onAccessDenied = jest.fn()
    render(
      <AdminSection
        onSectionChange={jest.fn()}
        onAccessDenied={onAccessDenied}
      />
    )
    await waitFor(() => {
      expect(onAccessDenied).toHaveBeenCalled()
    })
  })
})
