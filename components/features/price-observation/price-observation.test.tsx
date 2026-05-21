import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PriceObservationSection } from './price-observation'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('@/hooks/use-price-observations', () => ({
  usePriceObservations: jest.fn(),
}))

jest.mock('@/hooks/use-ingredients', () => ({
  useIngredients: jest.fn(),
}))

jest.mock('@/hooks/use-suppliers', () => ({
  useSuppliers: jest.fn(),
}))

jest.mock('@/components/features/shared/section-back-button', () => ({
  SectionBackButton: ({ onClick }: { onClick: () => void }) => (
    <button onClick={onClick}>back</button>
  ),
}))

jest.mock('@/components/features/shared/error-notice-dialog', () => ({
  ErrorNoticeDialog: () => null,
}))

import { usePriceObservations } from '@/hooks/use-price-observations'
import { useIngredients } from '@/hooks/use-ingredients'
import { useSuppliers } from '@/hooks/use-suppliers'

const mockIngredient = { id: 'ing-1', name: 'Tomato', purchase_unit: 'kg', user_id: 'u1' }
const mockSupplier = { id: 'sup-1', name: 'FreshCo', user_id: 'u1' }
const mockBestPrice = {
  rank: 1,
  supplier_id: 'sup-1',
  price_per_unit: '1.50',
  unit: 'kg',
  currency: 'EUR',
  observed_at: '2026-05-01T10:00:00Z',
  pack_label: null,
}

function buildObsHook(overrides = {}) {
  return {
    bestPrices: [],
    history: [],
    loading: false,
    mutationLoading: false,
    error: null,
    loadBest: jest.fn().mockResolvedValue(undefined),
    loadHistory: jest.fn().mockResolvedValue(undefined),
    create: jest.fn(),
    ...overrides,
  }
}

function buildIngHook(overrides = {}) {
  return {
    ingredients: [],
    loading: false,
    mutationLoading: false,
    error: null,
    loadAll: jest.fn().mockResolvedValue(undefined),
    getFilteredIngredients: jest.fn().mockReturnValue([]),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    reload: jest.fn(),
    ...overrides,
  }
}

function buildSupHook(overrides = {}) {
  return {
    suppliers: [],
    loading: false,
    mutationLoading: false,
    error: null,
    loadAll: jest.fn().mockResolvedValue(undefined),
    getFilteredSuppliers: jest.fn().mockReturnValue([]),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    reload: jest.fn(),
    ...overrides,
  }
}

global.fetch = jest.fn().mockResolvedValue({
  json: () => Promise.resolve({ success: true, data: { sales_records: 42, total_sales_line_total: '1000.00', ingredients: 5, recipes: 3, plates: 2, suppliers: 1, total_recipe_cost: '500.00' } }),
})

describe('PriceObservationSection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(usePriceObservations as jest.Mock).mockReturnValue(buildObsHook())
    ;(useIngredients as jest.Mock).mockReturnValue(buildIngHook())
    ;(useSuppliers as jest.Mock).mockReturnValue(buildSupHook())
  })

  it('renders accessible h1 heading', () => {
    render(<PriceObservationSection />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveAttribute('id', 'price-obs-heading')
  })

  it('section has aria-labelledby pointing to heading', () => {
    render(<PriceObservationSection />)
    const section = screen.getByRole('region')
    expect(section).toHaveAttribute('aria-labelledby', 'price-obs-heading')
  })

  it('calls onSectionChange with dashboard when back button clicked', () => {
    const onSectionChange = jest.fn()
    render(<PriceObservationSection onSectionChange={onSectionChange} />)
    fireEvent.click(screen.getByText('back'))
    expect(onSectionChange).toHaveBeenCalledWith('dashboard')
  })

  it('shows ingredient dropdown results when searching', async () => {
    ;(useIngredients as jest.Mock).mockReturnValue(
      buildIngHook({ ingredients: [mockIngredient] })
    )
    render(<PriceObservationSection />)
    const searchInput = screen.getByPlaceholderText('ingredientSearchPlaceholder')
    fireEvent.change(searchInput, { target: { value: 'Tom' } })
    await waitFor(() => {
      expect(screen.getByText('Tomato')).toBeInTheDocument()
    })
  })

  it('shows best price after ingredient is selected', async () => {
    ;(useIngredients as jest.Mock).mockReturnValue(
      buildIngHook({ ingredients: [mockIngredient] })
    )
    ;(useSuppliers as jest.Mock).mockReturnValue(
      buildSupHook({ suppliers: [mockSupplier] })
    )
    ;(usePriceObservations as jest.Mock).mockReturnValue(
      buildObsHook({ bestPrices: [mockBestPrice] })
    )
    render(<PriceObservationSection />)
    const searchInput = screen.getByPlaceholderText('ingredientSearchPlaceholder')
    fireEvent.change(searchInput, { target: { value: 'Tom' } })
    await waitFor(() => screen.getByText('Tomato'))
    fireEvent.click(screen.getByText('Tomato'))
    await waitFor(() => {
      expect(screen.getByText('#1')).toBeInTheDocument()
    })
  })

  it('opens create dialog when add button clicked after ingredient selected', async () => {
    ;(useIngredients as jest.Mock).mockReturnValue(
      buildIngHook({ ingredients: [mockIngredient] })
    )
    render(<PriceObservationSection />)
    const searchInput = screen.getByPlaceholderText('ingredientSearchPlaceholder')
    fireEvent.change(searchInput, { target: { value: 'Tom' } })
    await waitFor(() => screen.getByText('Tomato'))
    fireEvent.click(screen.getByText('Tomato'))

    await waitFor(() => screen.getByRole('button', { name: /addButton/i }))
    fireEvent.click(screen.getByRole('button', { name: /addButton/i }))

    await waitFor(() => {
      expect(screen.getByText('createDialog.title')).toBeInTheDocument()
    })
  })

  it('shows select-ingredient hint alert when no ingredient is selected', () => {
    render(<PriceObservationSection />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('hint.selectIngredient.title')).toBeInTheDocument()
    expect(screen.getByText('hint.selectIngredient.description')).toBeInTheDocument()
  })

  it('hides select-ingredient hint alert once an ingredient is selected', async () => {
    ;(useIngredients as jest.Mock).mockReturnValue(
      buildIngHook({ ingredients: [mockIngredient] })
    )
    render(<PriceObservationSection />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
    const searchInput = screen.getByPlaceholderText('ingredientSearchPlaceholder')
    fireEvent.change(searchInput, { target: { value: 'Tom' } })
    await waitFor(() => screen.getByText('Tomato'))
    fireEvent.click(screen.getByText('Tomato'))
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  it('shows PDF export button after ingredient selected', async () => {
    ;(useIngredients as jest.Mock).mockReturnValue(
      buildIngHook({ ingredients: [mockIngredient] })
    )
    render(<PriceObservationSection />)
    const searchInput = screen.getByPlaceholderText('ingredientSearchPlaceholder')
    fireEvent.change(searchInput, { target: { value: 'Tom' } })
    await waitFor(() => screen.getByText('Tomato'))
    fireEvent.click(screen.getByText('Tomato'))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /pdf\.export/i })).toBeInTheDocument()
    })
  })
})
