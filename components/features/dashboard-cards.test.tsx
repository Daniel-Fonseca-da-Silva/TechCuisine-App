import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { DashboardCards } from './dashboard-cards'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

describe('DashboardCards', () => {
  it('renders base cards', () => {
    const onCardClick = jest.fn()
    render(<DashboardCards onCardClick={onCardClick} />)
    expect(screen.getByText('recipes.title')).toBeInTheDocument()
    expect(screen.getByText('ingredients.title')).toBeInTheDocument()
    expect(screen.getByText('suppliers.title')).toBeInTheDocument()
    expect(screen.getByText('sales-records.title')).toBeInTheDocument()
    expect(screen.getByText('price-observations.title')).toBeInTheDocument()
    expect(screen.getByText('reports.title')).toBeInTheDocument()
    expect(screen.getByText('profile.title')).toBeInTheDocument()
    expect(screen.getByText('settings.title')).toBeInTheDocument()
    expect(screen.getByText('plans.title')).toBeInTheDocument()
  })

  it('does not render admin card when isAdmin is false', () => {
    render(<DashboardCards onCardClick={jest.fn()} />)
    expect(screen.queryByText('admin.title')).not.toBeInTheDocument()
  })

  it('renders admin card when isAdmin is true', () => {
    render(<DashboardCards onCardClick={jest.fn()} isAdmin />)
    expect(screen.getByText('admin.title')).toBeInTheDocument()
  })

  it('calls onCardClick with card id when clicked', () => {
    const onCardClick = jest.fn()
    render(<DashboardCards onCardClick={onCardClick} />)
    fireEvent.click(screen.getByText('recipes.title'))
    expect(onCardClick).toHaveBeenCalledWith('recipes')
  })

  it('calls onCardClick with admin id when admin card is clicked', () => {
    const onCardClick = jest.fn()
    render(<DashboardCards onCardClick={onCardClick} isAdmin />)
    fireEvent.click(screen.getByText('admin.title'))
    expect(onCardClick).toHaveBeenCalledWith('admin')
  })
})
