import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { IngredientsSection } from './ingredients'
import type { Ingredient } from '@/types/ingredient.types'
import type { Supplier } from '@/types/supplier.types'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('@/hooks/use-ingredients', () => ({
  useIngredients: jest.fn(),
}))

jest.mock('@/hooks/use-suppliers', () => ({
  useSuppliers: jest.fn(),
}))

jest.mock('@/hooks/use-preferences-locale', () => ({
  usePreferencesLocale: jest.fn(),
}))

jest.mock('@/components/features/shared/section-back-button', () => ({
  SectionBackButton: ({ onClick }: { onClick: () => void }) => (
    <button type="button" onClick={onClick}>
      back
    </button>
  ),
}))

jest.mock('@/components/features/shared/error-notice-dialog', () => ({
  ErrorNoticeDialog: () => null,
}))

jest.mock('./ingredient-list-skeleton', () => ({
  IngredientListSkeleton: () => <div data-testid="ingredient-list-skeleton" />,
}))

import { useIngredients } from '@/hooks/use-ingredients'
import { useSuppliers } from '@/hooks/use-suppliers'
import { usePreferencesLocale } from '@/hooks/use-preferences-locale'

const mockIngredient: Ingredient = {
  id: 'ing-1',
  user_id: 'u1',
  name: 'Tomato',
  purchase_unit: 'kg',
  tags: [],
  active: true,
  category: 'Produce',
  supplier_ids: [],
}

const mockSupplier: Supplier = {
  id: 'sup-1',
  user_id: 'u1',
  name: 'Best Supplier',
  supplier_type: 'distributor',
  contact_phone: null,
  contact_email: null,
  address: null,
  notes: null,
  active: true,
}

function buildSupHook(overrides: Record<string, unknown> = {}) {
  const suppliers = (overrides.suppliers as Supplier[] | undefined) ?? []
  return {
    suppliers,
    loading: false,
    mutationLoading: false,
    error: null,
    loadAll: jest.fn().mockResolvedValue(undefined),
    getFilteredSuppliers: (search: string) => {
      const q = search.trim().toLowerCase()
      if (!q) return suppliers
      return suppliers.filter((s) => s.name.toLowerCase().includes(q))
    },
    create: jest.fn().mockResolvedValue({ error: null }),
    update: jest.fn().mockResolvedValue({ error: null }),
    remove: jest.fn().mockResolvedValue({ error: null }),
    reload: jest.fn(),
    ...overrides,
  }
}

function buildIngHook(overrides: Record<string, unknown> = {}) {
  const ingredients = (overrides.ingredients as Ingredient[] | undefined) ?? []
  return {
    ingredients,
    loading: false,
    mutationLoading: false,
    error: null,
    loadAll: jest.fn().mockResolvedValue(undefined),
    getFilteredIngredients: (search: string) => {
      const q = search.trim().toLowerCase()
      if (!q) return ingredients
      return ingredients.filter((i) => i.name.toLowerCase().includes(q))
    },
    create: jest.fn().mockResolvedValue({ error: null }),
    update: jest.fn().mockResolvedValue({ error: null }),
    remove: jest.fn().mockResolvedValue({ error: null }),
    reload: jest.fn(),
    ...overrides,
  }
}

describe('IngredientsSection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useIngredients as jest.Mock).mockReturnValue(buildIngHook())
    ;(useSuppliers as jest.Mock).mockReturnValue(buildSupHook())
    ;(usePreferencesLocale as jest.Mock).mockReturnValue({
      currency: 'EUR',
      decimalSeparator: '.',
      language: ['en'],
    })
  })

  it('renders title as h1', () => {
    render(<IngredientsSection />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('title')
  })

  it('loads ingredients on mount', () => {
    const loadAll = jest.fn().mockResolvedValue(undefined)
    ;(useIngredients as jest.Mock).mockReturnValue(buildIngHook({ loadAll }))
    render(<IngredientsSection />)
    expect(loadAll).toHaveBeenCalled()
  })

  it('shows skeleton while loading', () => {
    ;(useIngredients as jest.Mock).mockReturnValue(buildIngHook({ loading: true }))
    render(<IngredientsSection />)
    expect(screen.getByTestId('ingredient-list-skeleton')).toBeInTheDocument()
  })

  it('shows load error state and retries when retry clicked', () => {
    const loadAll = jest.fn().mockResolvedValue(undefined)
    ;(useIngredients as jest.Mock).mockReturnValue(
      buildIngHook({ loading: false, error: 'failed', loadAll })
    )
    render(<IngredientsSection />)
    expect(screen.getByText('errorState.title')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'errorState.retry' }))
    expect(loadAll).toHaveBeenCalledTimes(2)
  })

  it('shows empty state when there are no ingredients', () => {
    render(<IngredientsSection />)
    expect(screen.getByText('emptyState.title')).toBeInTheDocument()
  })

  it('shows no-results empty state when search has no matches', () => {
    ;(useIngredients as jest.Mock).mockReturnValue(
      buildIngHook({ ingredients: [mockIngredient] })
    )
    render(<IngredientsSection />)
    const search = screen.getByPlaceholderText('searchPlaceholder')
    fireEvent.change(search, { target: { value: 'zzz' } })
    expect(screen.getByText('emptyState.noResults')).toBeInTheDocument()
  })

  it('renders ingredient row with name and active badge', () => {
    ;(useIngredients as jest.Mock).mockReturnValue(
      buildIngHook({ ingredients: [mockIngredient] })
    )
    render(<IngredientsSection />)
    expect(screen.getByText('Tomato')).toBeInTheDocument()
    expect(screen.getByText('active')).toBeInTheDocument()
  })

  it('calls onSectionChange with dashboard when back is clicked', () => {
    const onSectionChange = jest.fn()
    render(<IngredientsSection onSectionChange={onSectionChange} />)
    fireEvent.click(screen.getByText('back'))
    expect(onSectionChange).toHaveBeenCalledWith('dashboard')
  })

  it('opens create dialog and submits new ingredient', async () => {
    const create = jest.fn().mockResolvedValue({ error: null })
    ;(useIngredients as jest.Mock).mockReturnValue(buildIngHook({ create }))
    render(<IngredientsSection />)
    fireEvent.click(screen.getByRole('button', { name: /addButton/i }))

    await waitFor(() => {
      expect(screen.getByText('createDialog.title')).toBeInTheDocument()
    })

    const textboxes = screen.getAllByRole('textbox')
    fireEvent.change(textboxes[0], { target: { value: 'Sea salt' } })
    fireEvent.change(textboxes[1], { target: { value: 'kg' } })

    fireEvent.click(screen.getByRole('button', { name: 'form.save' }))

    await waitFor(() => {
      expect(create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Sea salt',
          purchase_unit: 'kg',
          supplier_ids: [],
        })
      )
    })
  })

  it('adds a supplier in create dialog and sends it in the payload', async () => {
    const create = jest.fn().mockResolvedValue({ error: null })
    ;(useIngredients as jest.Mock).mockReturnValue(buildIngHook({ create }))
    ;(useSuppliers as jest.Mock).mockReturnValue(buildSupHook({ suppliers: [mockSupplier] }))
    render(<IngredientsSection />)
    fireEvent.click(screen.getByRole('button', { name: /addButton/i }))

    await waitFor(() => {
      expect(screen.getByText('createDialog.title')).toBeInTheDocument()
    })

    const textboxes = screen.getAllByRole('textbox')
    fireEvent.change(textboxes[0], { target: { value: 'Olive oil' } })
    fireEvent.change(textboxes[1], { target: { value: 'L' } })

    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'sup-1' } })
    fireEvent.click(screen.getByRole('button', { name: 'form.addSupplier' }))

    fireEvent.click(screen.getByRole('button', { name: 'form.save' }))

    await waitFor(() => {
      expect(create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Olive oil',
          purchase_unit: 'L',
          supplier_ids: ['sup-1'],
        })
      )
    })
  })

  it('edits ingredient and preserves supplier_ids in update payload', async () => {
    const update = jest.fn().mockResolvedValue({ error: null })
    const ingredientWithSupplier = { ...mockIngredient, supplier_ids: ['sup-1'] }
    ;(useIngredients as jest.Mock).mockReturnValue(
      buildIngHook({ ingredients: [ingredientWithSupplier], update })
    )
    ;(useSuppliers as jest.Mock).mockReturnValue(buildSupHook({ suppliers: [mockSupplier] }))
    render(<IngredientsSection />)

    fireEvent.click(screen.getByRole('button', { name: 'editButton' }))

    await waitFor(() => {
      expect(screen.getByText('editDialog.title')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'form.save' }))

    await waitFor(() => {
      expect(update).toHaveBeenCalledWith(
        'ing-1',
        expect.objectContaining({ supplier_ids: ['sup-1'] })
      )
    })
  })
})
