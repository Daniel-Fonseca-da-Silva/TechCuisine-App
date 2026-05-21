import React from 'react'
import { render, screen } from '@testing-library/react'
import { AdminStats } from './admin-stats'
import type { AdminDashboardStats } from './admin-section'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('@/components/ui/chart', () => ({
  ChartContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="chart-container">{children}</div>,
  ChartTooltip: () => null,
  ChartTooltipContent: () => null,
}))

jest.mock('recharts', () => ({
  BarChart: () => <div data-testid="bar-chart">BarChart</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
}))

const mockStats: AdminDashboardStats = {
  users: 42,
  ingredients: 10,
  recipes: 5,
  plates: 3,
  suppliers: 4,
  sales_records: 8,
  total_sales_line_total: '1234.56',
  total_recipe_cost: '567.89',
}

describe('AdminStats', () => {
  it('shows loading state when isLoading is true', () => {
    const { container } = render(<AdminStats stats={null} isLoading />)
    const pulse = container.querySelector('[class*="animate-pulse"]')
    expect(pulse).toBeInTheDocument()
  })

  it('shows loading state when stats is null', () => {
    const { container } = render(<AdminStats stats={null} isLoading={false} />)
    const pulse = container.querySelector('[class*="animate-pulse"]')
    expect(pulse).toBeInTheDocument()
  })

  it('renders count labels and values when stats are loaded', () => {
    render(<AdminStats stats={mockStats} isLoading={false} />)
    expect(screen.getByText('usersCount')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByText('ingredientsCount')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('renders stats chart section', () => {
    render(<AdminStats stats={mockStats} isLoading={false} />)
    expect(screen.getByText('stats')).toBeInTheDocument()
    expect(screen.getByTestId('chart-container')).toBeInTheDocument()
  })
})
