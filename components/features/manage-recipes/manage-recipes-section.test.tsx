import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ManageRecipesSection } from './manage-recipes-section'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, _params?: Record<string, unknown>) => key,
}))

const mockLoadAll = jest.fn()
const mockCreate = jest.fn()
const mockUpdate = jest.fn()
const mockRemove = jest.fn()
const mockScale = jest.fn()
const mockGetFilteredRecipes = jest.fn(() => [])

const mockUseRecipes = jest.fn(() => ({
  loading: false,
  mutationLoading: false,
  error: null,
  loadAll: mockLoadAll,
  getFilteredRecipes: mockGetFilteredRecipes,
  create: mockCreate,
  update: mockUpdate,
  remove: mockRemove,
  scale: mockScale,
  reload: mockLoadAll,
  recipes: [],
}))

jest.mock('@/hooks/use-recipes', () => ({
  useRecipes: () => mockUseRecipes(),
}))

jest.mock('@/hooks/use-ingredients', () => ({
  useIngredients: () => ({
    ingredients: [],
    loadAll: jest.fn(),
  }),
}))

jest.mock('@/lib/subscription-errors', () => ({
  isSubscriptionBlockedMessage: (msg: string) => msg.includes('subscription'),
}))

jest.mock('./recipe-card', () => ({
  RecipeCard: ({
    recipe,
    onView,
    onEdit,
    onDelete,
  }: {
    recipe: { id: string; name: string }
    onView: (id: string) => void
    onEdit: (r: unknown) => void
    onDelete: (r: unknown) => void
  }) => (
    <div data-testid="recipe-card">
      <button data-testid={`view-${recipe.id}`} onClick={() => onView(recipe.id)}>
        {recipe.name}
      </button>
      <button data-testid={`edit-${recipe.id}`} onClick={() => onEdit(recipe)}>Edit</button>
      <button data-testid={`delete-${recipe.id}`} onClick={() => onDelete(recipe)}>Delete</button>
    </div>
  ),
}))

jest.mock('./recipe-filters', () => ({
  RecipeFilters: () => <div data-testid="recipe-filters">RecipeFilters</div>,
}))

jest.mock('./manage-recipes-skeleton', () => ({
  RecipeSkeleton: () => <div data-testid="recipe-skeleton">Skeleton</div>,
}))

jest.mock('./recipe-form-dialog', () => ({
  RecipeFormDialog: ({
    open,
    onSave,
    mutationLoading: _ml,
    formError,
  }: {
    open: boolean
    onOpenChange: (o: boolean) => void
    editingRecipe: unknown
    onSave: (p: unknown) => void
    mutationLoading: boolean
    formError: string | null
  }) =>
    open ? (
      <div data-testid="recipe-form-dialog">
        {formError && <p data-testid="form-error">{formError}</p>}
        <button data-testid="form-save" onClick={() => onSave({ name: 'New Recipe', reference_portions: 4 })}>
          Save
        </button>
      </div>
    ) : null,
}))

jest.mock('./recipe-scale-dialog', () => ({
  RecipeScaleDialog: ({ open }: { open: boolean }) =>
    open ? <div data-testid="scale-dialog">Scale Dialog</div> : null,
}))

jest.mock('@/components/features/shared/error-notice-dialog', () => ({
  ErrorNoticeDialog: ({ open }: { open: boolean }) =>
    open ? <div data-testid="error-notice-dialog">Error</div> : null,
}))

const sampleRecipe = {
  id: 'r1',
  user_id: 'u1',
  name: 'Bolo de Chocolate',
  description: 'Receita deliciosa',
  reference_portions: 8,
  status: 'completed' as const,
  chef_notes: null,
  cost_per_portion: '2.50',
  total_recipe_cost: '20.00',
  total_ingredient_cost: null,
  total_preparation_cost: null,
  selling_price_per_portion: null,
  ingredient_lines: [],
  preparation_costs: [],
}

describe('ManageRecipesSection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCreate.mockResolvedValue({ recipe: sampleRecipe, error: null })
    mockUpdate.mockResolvedValue({ recipe: sampleRecipe, error: null })
    mockRemove.mockResolvedValue({ success: true, error: null })
  })

  it('renders title and back button', () => {
    render(<ManageRecipesSection />)
    expect(screen.getByText('title')).toBeInTheDocument()
    expect(screen.getByTestId('section-back-button')).toBeInTheDocument()
  })

  it('renders add button', () => {
    render(<ManageRecipesSection />)
    expect(screen.getAllByRole('button', { name: /addButton/i }).length).toBeGreaterThan(0)
  })

  it('calls onSectionChange with dashboard when Back is clicked', () => {
    const onSectionChange = jest.fn()
    render(<ManageRecipesSection onSectionChange={onSectionChange} />)
    fireEvent.click(screen.getByTestId('section-back-button'))
    expect(onSectionChange).toHaveBeenCalledWith('dashboard')
  })

  it('renders recipe filters', () => {
    render(<ManageRecipesSection />)
    expect(screen.getByTestId('recipe-filters')).toBeInTheDocument()
  })

  it('calls loadAll on mount', () => {
    render(<ManageRecipesSection />)
    expect(mockLoadAll).toHaveBeenCalled()
  })

  it('shows skeletons when loading', () => {
    mockUseRecipes.mockReturnValueOnce({
      loading: true,
      mutationLoading: false,
      error: null,
      loadAll: mockLoadAll,
      getFilteredRecipes: mockGetFilteredRecipes,
      create: mockCreate,
      update: mockUpdate,
      remove: mockRemove,
      scale: mockScale,
      reload: mockLoadAll,
      recipes: [],
    })
    render(<ManageRecipesSection />)
    expect(screen.getAllByTestId('recipe-skeleton').length).toBeGreaterThan(0)
  })

  it('shows empty state with add CTA when no recipes', () => {
    render(<ManageRecipesSection />)
    expect(screen.getByText('emptyState.title')).toBeInTheDocument()
  })

  it('renders recipe cards when recipes exist', () => {
    mockGetFilteredRecipes.mockReturnValue([sampleRecipe])
    render(<ManageRecipesSection />)
    expect(screen.getAllByTestId('recipe-card')).toHaveLength(1)
    expect(screen.getByText('Bolo de Chocolate')).toBeInTheDocument()
  })

  it('opens detail modal when view is clicked', () => {
    mockGetFilteredRecipes.mockReturnValue([sampleRecipe])
    render(<ManageRecipesSection />)
    fireEvent.click(screen.getByTestId('view-r1'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('closes detail modal when close button is clicked', async () => {
    mockGetFilteredRecipes.mockReturnValue([sampleRecipe])
    render(<ManageRecipesSection />)
    fireEvent.click(screen.getByTestId('view-r1'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /detail\.close/i }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('shows error state and retry button on error', () => {
    mockUseRecipes.mockReturnValueOnce({
      loading: false,
      mutationLoading: false,
      error: 'Failed to load recipes',
      loadAll: mockLoadAll,
      getFilteredRecipes: mockGetFilteredRecipes,
      create: mockCreate,
      update: mockUpdate,
      remove: mockRemove,
      scale: mockScale,
      reload: mockLoadAll,
      recipes: [],
    })
    render(<ManageRecipesSection />)
    expect(screen.getByText('errorState.title')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /errorState\.retry/i })).toBeInTheDocument()
  })

  it('opens create form when add button is clicked', () => {
    render(<ManageRecipesSection />)
    fireEvent.click(screen.getAllByRole('button', { name: /addButton/i })[0])
    expect(screen.getByTestId('recipe-form-dialog')).toBeInTheDocument()
  })

  it('calls create when form is saved in create mode', async () => {
    render(<ManageRecipesSection />)
    fireEvent.click(screen.getAllByRole('button', { name: /addButton/i })[0])
    fireEvent.click(screen.getByTestId('form-save'))
    await waitFor(() => expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ name: 'New Recipe' })))
  })

  it('shows delete confirmation dialog', () => {
    mockGetFilteredRecipes.mockReturnValue([sampleRecipe])
    render(<ManageRecipesSection />)
    fireEvent.click(screen.getByTestId('delete-r1'))
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    expect(screen.getByText('deleteDialog.title')).toBeInTheDocument()
  })

  it('calls remove when delete is confirmed', async () => {
    mockGetFilteredRecipes.mockReturnValue([sampleRecipe])
    render(<ManageRecipesSection />)
    fireEvent.click(screen.getByTestId('delete-r1'))
    fireEvent.click(screen.getByRole('button', { name: /deleteDialog\.confirm/i }))
    await waitFor(() => expect(mockRemove).toHaveBeenCalledWith('r1'))
  })

  it('shows error notice on subscription-blocked mutation error', async () => {
    mockCreate.mockResolvedValueOnce({ recipe: null, error: 'not available for your subscription plan' })
    render(<ManageRecipesSection />)
    fireEvent.click(screen.getAllByRole('button', { name: /addButton/i })[0])
    fireEvent.click(screen.getByTestId('form-save'))
    await waitFor(() => expect(screen.getByTestId('error-notice-dialog')).toBeInTheDocument())
  })
})
