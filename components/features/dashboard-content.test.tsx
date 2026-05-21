import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { DashboardContent } from './dashboard-content'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('./dashboard-cards', () => ({
  DashboardCards: ({ onCardClick }: { onCardClick: (s: string) => void }) => (
    <div data-testid="dashboard-cards">
      <button type="button" onClick={() => onCardClick('profile')}>Profile</button>
    </div>
  ),
}))

jest.mock('./dashboard-cards-skeleton', () => ({
  DashboardCardsSkeleton: () => <div data-testid="dashboard-cards-skeleton" />,
}))

jest.mock('./manage-recipes/manage-recipes-section', () => ({
  ManageRecipesSection: () => <div data-testid="recipes">Recipes</div>,
}))
jest.mock('./profile/profile-section', () => ({
  ProfileSection: () => <div data-testid="profile">Profile</div>,
}))
jest.mock('./settings/settings-section', () => ({
  SettingsSection: () => <div data-testid="settings">Settings</div>,
}))
jest.mock('./my-plans/plans-section', () => ({
  PlansSection: () => <div data-testid="plans">Plans</div>,
}))
jest.mock('./admin/admin-section', () => ({
  AdminSection: () => <div data-testid="admin">Admin</div>,
}))
jest.mock('./ingredients/ingredients', () => ({
  IngredientsSection: () => <div data-testid="ingredients">Ingredients</div>,
}))
jest.mock('./plates/plates', () => ({
  PlatesSection: () => <div data-testid="plates">Plates</div>,
}))
jest.mock('./suppliers/suppliers', () => ({
  SuppliersSection: () => <div data-testid="suppliers">Suppliers</div>,
}))
jest.mock('./sales-records/sales-records', () => ({
  SalesRecordsSection: () => <div data-testid="sales-records">Sales Records</div>,
}))
jest.mock('./price-observation/price-observation', () => ({
  PriceObservationSection: () => <div data-testid="price-observations">Price Observations</div>,
}))
jest.mock('./reports/reports-section', () => ({
  ReportsSection: () => <div data-testid="reports">Reports</div>,
}))

describe('DashboardContent', () => {
  it('renders dashboard cards when activeSection is dashboard', async () => {
    render(
      <DashboardContent activeSection="dashboard" onSectionChange={jest.fn()} />
    )
    expect(await screen.findByTestId('dashboard-cards')).toBeInTheDocument()
  })

  it('renders profile section when activeSection is profile', () => {
    render(
      <DashboardContent activeSection="profile" onSectionChange={jest.fn()} />
    )
    expect(screen.getByTestId('profile')).toBeInTheDocument()
  })

  it('renders recipes section when activeSection is recipes', () => {
    render(
      <DashboardContent activeSection="recipes" onSectionChange={jest.fn()} />
    )
    expect(screen.getByTestId('recipes')).toBeInTheDocument()
  })

  it('renders access denied when activeSection is admin and not isAdmin', () => {
    render(
      <DashboardContent activeSection="admin" onSectionChange={jest.fn()} isAdmin={false} />
    )
    expect(screen.getByText('accessDenied')).toBeInTheDocument()
  })

  it('renders admin section when activeSection is admin and isAdmin', () => {
    render(
      <DashboardContent activeSection="admin" onSectionChange={jest.fn()} isAdmin />
    )
    expect(screen.getByTestId('admin')).toBeInTheDocument()
  })

  it('renders dashboard cards as default for unknown section', async () => {
    render(
      <DashboardContent activeSection="unknown-section" onSectionChange={jest.fn()} />
    )
    expect(await screen.findByTestId('dashboard-cards')).toBeInTheDocument()
  })

  it('calls onSectionChange when card is clicked', () => {
    const onSectionChange = jest.fn()
    render(
      <DashboardContent activeSection="dashboard" onSectionChange={onSectionChange} />
    )
    fireEvent.click(screen.getByText('Profile'))
    expect(onSectionChange).toHaveBeenCalledWith('profile')
  })
})
